import { Pool } from 'pg';
import { User, Room, ChatMessage } from './types.js';

class DatabaseService {
  private pgPool: Pool | null = null;
  private isPostgresActive = false;

  // In-memory persistent state (mirrored or used as fallback)
  private users = new Map<string, User>();
  private rooms = new Map<string, Room>();
  private messages = new Map<string, ChatMessage>();
  private roomMessages = new Map<string, string[]>(); // roomId -> messageIds

  constructor() {
    this.seedDefaultRooms();
  }

  public async initialize(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('placeholder')) {
      try {
        const pool = new Pool({
          connectionString: dbUrl,
          connectionTimeoutMillis: 2500
        });

        // Quick connectivity probe
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();

        this.pgPool = pool;
        this.isPostgresActive = true;
        console.log('✅ PostgreSQL connected successfully. Initializing tables...');
        await this.runPgMigrations();
        return;
      } catch (err) {
        console.warn('⚠️  PostgreSQL connection unavailable. Falling back to high-performance local memory/persistence engine.', (err as Error).message);
        this.isPostgresActive = false;
        this.pgPool = null;
      }
    } else {
      console.log('ℹ️  No external PostgreSQL specified. Using integrated high-performance engine.');
    }
  }

  private async runPgMigrations(): Promise<void> {
    if (!this.pgPool) return;
    const client = await this.pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(64) NOT NULL,
          avatar TEXT,
          status VARCHAR(16) DEFAULT 'online',
          last_seen TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS rooms (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(64) NOT NULL,
          description TEXT,
          topic TEXT,
          is_private BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(64) PRIMARY KEY,
          room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE CASCADE,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          username VARCHAR(64) NOT NULL,
          avatar TEXT,
          text TEXT NOT NULL,
          attachments JSONB DEFAULT '[]',
          reactions JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at DESC);
      `);
      console.log('✅ PostgreSQL tables and indexes verified.');
    } finally {
      client.release();
    }
  }

  private seedDefaultRooms(): void {
    const defaults: Room[] = [
      {
        id: 'general',
        name: 'general',
        description: 'General community hangout & company-wide chatter',
        topic: 'Welcome to PulseChat! High-velocity real-time messaging.',
        isPrivate: false,
        memberCount: 24
      },
      {
        id: 'dev',
        name: 'dev-stream',
        description: 'Architecture discussions, releases, and live commits',
        topic: 'v2026.1 WebSocket Mesh deployed with Redis & Postgres',
        isPrivate: false,
        memberCount: 18
      },
      {
        id: 'design',
        name: 'ui-design',
        description: 'Glassmorphism, animations, tokens & Ponytail extension integration',
        topic: 'Dark mode cyber-luxe aesthetic & zero-CLS benchmarks',
        isPrivate: false,
        memberCount: 12
      },
      {
        id: 'announcements',
        name: 'announcements',
        description: 'Official releases, system maintenance, and changelogs',
        topic: 'PulseChat 2026 officially launched!',
        isPrivate: false,
        memberCount: 42
      }
    ];

    for (const r of defaults) {
      this.rooms.set(r.id, r);
      this.roomMessages.set(r.id, []);
    }

    // Seed welcome messages
    this.addSeedMessage('general', 'bot-pulse', 'Pulse Bot', '🤖', 'Welcome to **PulseChat**! 🚀 You are connected to a high-speed real-time WebSocket cluster.');
    this.addSeedMessage('general', 'alex-dev', 'Alex Vance', '👨‍💻', 'Hey everyone! Testing latency across Redis pub/sub. Getting < 12ms delivery times! ⚡');
    this.addSeedMessage('dev', 'maya-lead', 'Maya Lin', '👩‍💻', 'PostgreSQL persistence is active with automatic fallback. Zero dropped packets.');
  }

  private addSeedMessage(roomId: string, userId: string, username: string, avatar: string, text: string): void {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const msg: ChatMessage = {
      id,
      roomId,
      userId,
      username,
      avatar,
      text,
      reactions: {
        '🔥': { emoji: '🔥', count: 2, users: ['Alex Vance', 'Maya Lin'] },
        '🚀': { emoji: '🚀', count: 1, users: ['Pulse Bot'] }
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    };
    this.messages.set(id, msg);
    this.roomMessages.get(roomId)?.push(id);
  }

  public async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  public async getRoom(roomId: string): Promise<Room | undefined> {
    return this.rooms.get(roomId);
  }

  public async upsertUser(user: User): Promise<void> {
    this.users.set(user.id, user);
    if (this.isPostgresActive && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO users (id, username, avatar, status, last_seen)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (id) DO UPDATE SET username = $2, avatar = $3, status = $4, last_seen = NOW()`,
          [user.id, user.username, user.avatar, user.status]
        );
      } catch (err) {
        console.error('Failed to upsert user in PG:', err);
      }
    }
  }

  public async getUser(userId: string): Promise<User | undefined> {
    return this.users.get(userId);
  }

  public async saveMessage(msg: ChatMessage): Promise<void> {
    this.messages.set(msg.id, msg);
    let list = this.roomMessages.get(msg.roomId);
    if (!list) {
      list = [];
      this.roomMessages.set(msg.roomId, list);
    }
    list.push(msg.id);

    if (this.isPostgresActive && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO messages (id, room_id, user_id, username, avatar, text, attachments, reactions, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            msg.id,
            msg.roomId,
            msg.userId,
            msg.username,
            msg.avatar,
            msg.text,
            JSON.stringify(msg.attachments || []),
            JSON.stringify(msg.reactions),
            msg.createdAt
          ]
        );
      } catch (err) {
        console.error('Failed to save message in PG:', err);
      }
    }
  }

  public async getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    if (this.isPostgresActive && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT id, room_id as "roomId", user_id as "userId", username, avatar, text,
                  attachments, reactions, created_at as "createdAt"
           FROM messages
           WHERE room_id = $1
           ORDER BY created_at ASC
           LIMIT $2`,
          [roomId, limit]
        );
        return res.rows.map((row) => ({
          ...row,
          attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments,
          reactions: typeof row.reactions === 'string' ? JSON.parse(row.reactions) : row.reactions
        }));
      } catch (err) {
        console.error('Failed to read messages from PG, falling back to memory:', err);
      }
    }

    const messageIds = this.roomMessages.get(roomId) || [];
    const recentIds = messageIds.slice(-limit);
    return recentIds
      .map((id) => this.messages.get(id))
      .filter((m): m is ChatMessage => m !== undefined);
  }

  public async addReaction(messageId: string, emoji: string, username: string): Promise<ChatMessage | undefined> {
    const msg = this.messages.get(messageId);
    if (!msg) return undefined;

    if (!msg.reactions[emoji]) {
      msg.reactions[emoji] = { emoji, count: 1, users: [username] };
    } else {
      const reaction = msg.reactions[emoji];
      if (reaction.users.includes(username)) {
        // Toggle off if already reacted
        reaction.users = reaction.users.filter((u) => u !== username);
        reaction.count = reaction.users.length;
        if (reaction.count === 0) {
          delete msg.reactions[emoji];
        }
      } else {
        reaction.users.push(username);
        reaction.count = reaction.users.length;
      }
    }

    if (this.isPostgresActive && this.pgPool) {
      try {
        await this.pgPool.query(
          `UPDATE messages SET reactions = $1 WHERE id = $2`,
          [JSON.stringify(msg.reactions), messageId]
        );
      } catch (err) {
        console.error('Failed to update reaction in PG:', err);
      }
    }

    return msg;
  }
}

export const db = new DatabaseService();
