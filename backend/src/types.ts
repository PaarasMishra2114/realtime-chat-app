import { z } from 'zod';

export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  topic: string;
  isPrivate: boolean;
  memberCount: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // usernames
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  attachments?: string[];
  reactions: Record<string, MessageReaction>;
  createdAt: string;
}

export const ClientMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('AUTH'),
    payload: z.object({
      userId: z.string().min(1),
      username: z.string().min(1).max(32),
      avatar: z.string().optional()
    })
  }),
  z.object({
    type: z.literal('JOIN_ROOM'),
    payload: z.object({
      roomId: z.string().min(1)
    })
  }),
  z.object({
    type: z.literal('LEAVE_ROOM'),
    payload: z.object({
      roomId: z.string().min(1)
    })
  }),
  z.object({
    type: z.literal('SEND_MESSAGE'),
    payload: z.object({
      roomId: z.string().min(1),
      text: z.string().min(1).max(4000),
      attachments: z.array(z.string()).optional()
    })
  }),
  z.object({
    type: z.literal('TYPING_START'),
    payload: z.object({
      roomId: z.string().min(1)
    })
  }),
  z.object({
    type: z.literal('TYPING_STOP'),
    payload: z.object({
      roomId: z.string().min(1)
    })
  }),
  z.object({
    type: z.literal('ADD_REACTION'),
    payload: z.object({
      messageId: z.string().min(1),
      roomId: z.string().min(1),
      emoji: z.string().min(1).max(8)
    })
  }),
  z.object({
    type: z.literal('HEARTBEAT'),
    payload: z.object({}).optional()
  })
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;

export type ServerMessage =
  | { type: 'AUTH_SUCCESS'; payload: { user: User; rooms: Room[] } }
  | { type: 'ROOM_HISTORY'; payload: { roomId: string; messages: ChatMessage[]; onlineUsers: User[] } }
  | { type: 'NEW_MESSAGE'; payload: ChatMessage }
  | { type: 'USER_TYPING'; payload: { roomId: string; username: string; isTyping: boolean } }
  | { type: 'PRESENCE_UPDATE'; payload: { roomId: string; onlineUsers: User[] } }
  | { type: 'REACTION_UPDATED'; payload: { messageId: string; roomId: string; reactions: Record<string, MessageReaction> } }
  | { type: 'PONG'; payload: { timestamp: string } }
  | { type: 'ERROR'; payload: { code: string; message: string } };
