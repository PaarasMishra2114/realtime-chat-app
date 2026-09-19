import { User, Room, ChatMessage, ConnectionStatus } from '../types.js';

type Listener<T> = (data: T) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private statusListeners: Listener<ConnectionStatus>[] = [];
  private messageListeners: Listener<ChatMessage>[] = [];
  private historyListeners: Listener<{ roomId: string; messages: ChatMessage[]; onlineUsers: User[] }>[] = [];
  private presenceListeners: Listener<{ roomId: string; onlineUsers: User[] }>[] = [];
  private typingListeners: Listener<{ roomId: string; username: string; isTyping: boolean }>[] = [];
  private reactionListeners: Listener<{ messageId: string; roomId: string; reactions: any }>[] = [];
  private authSuccessListeners: Listener<{ user: User; rooms: Room[] }>[] = [];

  private currentStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private currentUser: { id: string; username: string; avatar: string } | null = null;
  private currentRoomId: string | null = null;

  public connect(url: string, user: { id: string; username: string; avatar: string }) {
    this.currentUser = user;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;

        // Authenticate immediately
        this.send('AUTH', {
          userId: user.id,
          username: user.username,
          avatar: user.avatar
        });

        // Start heartbeat ping
        this.startHeartbeat();

        // If previously in a room, rejoin
        if (this.currentRoomId) {
          this.joinRoom(this.currentRoomId);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
          
          // Extension bridge: mirror event to window for Ponytail side-panel
          window.postMessage({ source: 'pulsechat-extension-bridge', event: data }, '*');
        } catch (err) {
          console.error('Failed to parse incoming WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.cleanupHeartbeat();
        this.scheduleReconnect(url);
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket encountered error:', err);
        this.ws?.close();
      };
    } catch (err) {
      this.setStatus('disconnected');
      this.scheduleReconnect(url);
    }
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.currentUser) {
        this.connect(url, this.currentUser);
      }
    }, delay);
  }

  private startHeartbeat() {
    this.cleanupHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send('HEARTBEAT', {});
    }, 25000);
  }

  private cleanupHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleServerMessage(msg: any) {
    switch (msg.type) {
      case 'AUTH_SUCCESS':
        this.authSuccessListeners.forEach((fn) => fn(msg.payload));
        break;
      case 'ROOM_HISTORY':
        this.historyListeners.forEach((fn) => fn(msg.payload));
        break;
      case 'NEW_MESSAGE':
        this.messageListeners.forEach((fn) => fn(msg.payload));
        break;
      case 'PRESENCE_UPDATE':
        this.presenceListeners.forEach((fn) => fn(msg.payload));
        break;
      case 'USER_TYPING':
        this.typingListeners.forEach((fn) => fn(msg.payload));
        break;
      case 'REACTION_UPDATED':
        this.reactionListeners.forEach((fn) => fn(msg.payload));
        break;
    }
  }

  public joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.send('JOIN_ROOM', { roomId });
  }

  public leaveRoom(roomId: string) {
    this.send('LEAVE_ROOM', { roomId });
  }

  public sendMessage(roomId: string, text: string, attachments?: string[]) {
    this.send('SEND_MESSAGE', { roomId, text, attachments });
  }

  public startTyping(roomId: string) {
    this.send('TYPING_START', { roomId });
  }

  public stopTyping(roomId: string) {
    this.send('TYPING_STOP', { roomId });
  }

  public addReaction(messageId: string, roomId: string, emoji: string) {
    this.send('ADD_REACTION', { messageId, roomId, emoji });
  }

  private send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public onStatusChange(fn: Listener<ConnectionStatus>) {
    this.statusListeners.push(fn);
    fn(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((f) => f !== fn);
    };
  }

  public onAuthSuccess(fn: Listener<{ user: User; rooms: Room[] }>) {
    this.authSuccessListeners.push(fn);
    return () => {
      this.authSuccessListeners = this.authSuccessListeners.filter((f) => f !== fn);
    };
  }

  public onRoomHistory(fn: Listener<{ roomId: string; messages: ChatMessage[]; onlineUsers: User[] }>) {
    this.historyListeners.push(fn);
    return () => {
      this.historyListeners = this.historyListeners.filter((f) => f !== fn);
    };
  }

  public onNewMessage(fn: Listener<ChatMessage>) {
    this.messageListeners.push(fn);
    return () => {
      this.messageListeners = this.messageListeners.filter((f) => f !== fn);
    };
  }

  public onPresence(fn: Listener<{ roomId: string; onlineUsers: User[] }>) {
    this.presenceListeners.push(fn);
    return () => {
      this.presenceListeners = this.presenceListeners.filter((f) => f !== fn);
    };
  }

  public onTyping(fn: Listener<{ roomId: string; username: string; isTyping: boolean }>) {
    this.typingListeners.push(fn);
    return () => {
      this.typingListeners = this.typingListeners.filter((f) => f !== fn);
    };
  }

  public onReaction(fn: Listener<{ messageId: string; roomId: string; reactions: any }>) {
    this.reactionListeners.push(fn);
    return () => {
      this.reactionListeners = this.reactionListeners.filter((f) => f !== fn);
    };
  }
}

export const wsClient = new WebSocketClient();
