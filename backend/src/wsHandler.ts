import { WebSocket, WebSocketServer } from 'ws';
import { db } from './database.js';
import { pubsub } from './pubsub.js';
import { ClientMessageSchema, User, ChatMessage, ServerMessage } from './types.js';

interface ClientConnection {
  ws: WebSocket;
  user?: User;
  currentRoomId?: string;
  isAlive: boolean;
  unsubscribers: Array<() => void>;
}

export class WebSocketManager {
  private connections = new Map<WebSocket, ClientConnection>();
  private roomPresence = new Map<string, Set<string>>(); // roomId -> Set of userIds

  constructor(private wss: WebSocketServer) {
    this.setupHeartbeat();
  }

  public handleConnection(ws: WebSocket): void {
    const client: ClientConnection = {
      ws,
      isAlive: true,
      unsubscribers: []
    };
    this.connections.set(ws, client);

    ws.on('pong', () => {
      client.isAlive = true;
    });

    ws.on('message', async (data: Buffer | string) => {
      try {
        const rawString = data.toString();
        const json = JSON.parse(rawString);
        const parseResult = ClientMessageSchema.safeParse(json);

        if (!parseResult.success) {
          this.send(ws, {
            type: 'ERROR',
            payload: { code: 'INVALID_PAYLOAD', message: parseResult.error.message }
          });
          return;
        }

        const msg = parseResult.data;
        await this.routeMessage(client, msg);
      } catch (err) {
        this.send(ws, {
          type: 'ERROR',
          payload: { code: 'MALFORMED_JSON', message: 'Unable to parse JSON payload' }
        });
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(client);
    });

    ws.on('error', (err) => {
      console.warn('WebSocket connection error:', err.message);
      this.handleDisconnect(client);
    });
  }

  private async routeMessage(client: ClientConnection, msg: any): Promise<void> {
    switch (msg.type) {
      case 'AUTH': {
        const { userId, username, avatar } = msg.payload;
        const user: User = {
          id: userId,
          username,
          avatar: avatar || '👤',
          status: 'online',
          lastSeen: new Date().toISOString()
        };
        client.user = user;
        await db.upsertUser(user);

        const rooms = await db.getRooms();
        this.send(client.ws, {
          type: 'AUTH_SUCCESS',
          payload: { user, rooms }
        });
        break;
      }

      case 'JOIN_ROOM': {
        if (!client.user) {
          this.send(client.ws, {
            type: 'ERROR',
            payload: { code: 'UNAUTHORIZED', message: 'Authenticate first before joining a room' }
          });
          return;
        }

        const { roomId } = msg.payload;
        await this.switchRoom(client, roomId);
        break;
      }

      case 'LEAVE_ROOM': {
        const { roomId } = msg.payload;
        if (client.currentRoomId === roomId) {
          await this.leaveRoom(client);
        }
        break;
      }

      case 'SEND_MESSAGE': {
        if (!client.user) return;
        const { roomId, text, attachments } = msg.payload;
        const trimmed = text.trim();
        if (!trimmed) return;

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          roomId,
          userId: client.user.id,
          username: client.user.username,
          avatar: client.user.avatar,
          text: trimmed,
          attachments: attachments || [],
          reactions: {},
          createdAt: new Date().toISOString()
        };

        // 1. Save to DB (PostgreSQL / SQLite fallback)
        await db.saveMessage(newMsg);

        // 2. Broadcast via Redis Pub/Sub mesh
        await pubsub.publish(`room:${roomId}`, {
          type: 'NEW_MESSAGE',
          payload: newMsg
        });
        break;
      }

      case 'TYPING_START':
      case 'TYPING_STOP': {
        if (!client.user) return;
        const isTyping = msg.type === 'TYPING_START';
        await pubsub.publish(`room:${msg.payload.roomId}:telemetry`, {
          type: 'USER_TYPING',
          payload: {
            roomId: msg.payload.roomId,
            username: client.user.username,
            isTyping
          }
        });
        break;
      }

      case 'ADD_REACTION': {
        if (!client.user) return;
        const { messageId, roomId, emoji } = msg.payload;
        const updated = await db.addReaction(messageId, emoji, client.user.username);
        if (updated) {
          await pubsub.publish(`room:${roomId}`, {
            type: 'REACTION_UPDATED',
            payload: {
              messageId,
              roomId,
              reactions: updated.reactions
            }
          });
        }
        break;
      }

      case 'HEARTBEAT': {
        client.isAlive = true;
        this.send(client.ws, {
          type: 'PONG',
          payload: { timestamp: new Date().toISOString() }
        });
        break;
      }
    }
  }

  private async switchRoom(client: ClientConnection, newRoomId: string): Promise<void> {
    if (client.currentRoomId) {
      await this.leaveRoom(client);
    }

    client.currentRoomId = newRoomId;

    // Track presence
    let set = this.roomPresence.get(newRoomId);
    if (!set) {
      set = new Set();
      this.roomPresence.set(newRoomId, set);
    }
    if (client.user) {
      set.add(client.user.id);
    }

    // Subscribe to Redis pubsub channels for this room
    const unsubRoom = await pubsub.subscribe(`room:${newRoomId}`, (event: any) => {
      this.send(client.ws, event);
    });

    const unsubTelemetry = await pubsub.subscribe(`room:${newRoomId}:telemetry`, (event: any) => {
      // Don't echo typing indicators back to the sender
      if (event.type === 'USER_TYPING' && event.payload.username === client.user?.username) {
        return;
      }
      this.send(client.ws, event);
    });

    client.unsubscribers.push(unsubRoom, unsubTelemetry);

    // Send chat history and current online users
    const history = await db.getRoomMessages(newRoomId, 60);
    const onlineUsers = await this.getOnlineUsersInRoom(newRoomId);

    this.send(client.ws, {
      type: 'ROOM_HISTORY',
      payload: {
        roomId: newRoomId,
        messages: history,
        onlineUsers
      }
    });

    // Notify room peers of updated presence
    await this.broadcastPresence(newRoomId);
  }

  private async leaveRoom(client: ClientConnection): Promise<void> {
    const roomId = client.currentRoomId;
    if (!roomId) return;

    // Clear subscriptions
    for (const unsub of client.unsubscribers) {
      unsub();
    }
    client.unsubscribers = [];

    // Remove from presence
    const set = this.roomPresence.get(roomId);
    if (set && client.user) {
      set.delete(client.user.id);
    }

    client.currentRoomId = undefined;
    await this.broadcastPresence(roomId);
  }

  private async broadcastPresence(roomId: string): Promise<void> {
    const onlineUsers = await this.getOnlineUsersInRoom(roomId);
    await pubsub.publish(`room:${roomId}`, {
      type: 'PRESENCE_UPDATE',
      payload: {
        roomId,
        onlineUsers
      }
    });
  }

  private async getOnlineUsersInRoom(roomId: string): Promise<User[]> {
    const set = this.roomPresence.get(roomId);
    if (!set || set.size === 0) return [];

    const users: User[] = [];
    for (const userId of set) {
      const u = await db.getUser(userId);
      if (u) users.push(u);
    }
    return users;
  }

  private handleDisconnect(client: ClientConnection): void {
    if (client.currentRoomId) {
      this.leaveRoom(client).catch(() => {});
    }
    this.connections.delete(client.ws);
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private setupHeartbeat(): void {
    const timer = setInterval(() => {
      for (const [ws, client] of this.connections.entries()) {
        if (!client.isAlive) {
          console.log(`Terminating stale socket connection: ${client.user?.username || 'anonymous'}`);
          ws.terminate();
          this.handleDisconnect(client);
          continue;
        }
        client.isAlive = false;
        ws.ping();
      }
    }, 30000);
    if (timer.unref) {
      timer.unref();
    }
  }

  public getStats() {
    return {
      connectedClients: this.connections.size,
      activeRooms: this.roomPresence.size
    };
  }
}
