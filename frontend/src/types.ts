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
  users: string[];
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

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
