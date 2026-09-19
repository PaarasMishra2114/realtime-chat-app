import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

export type PubSubHandler = (channel: string, message: string) => void;

class PubSubService {
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private isRedisActive = false;
  private localBus = new EventEmitter();

  constructor() {
    this.localBus.setMaxListeners(200);
  }

  public async initialize(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && !redisUrl.includes('placeholder')) {
      try {
        const pub = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          retryStrategy: () => null // Don't block indefinitely on local dev without Redis
        });
        const sub = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          retryStrategy: () => null
        });

        await Promise.all([pub.connect(), sub.connect()]);

        this.pubClient = pub;
        this.subClient = sub;
        this.isRedisActive = true;

        this.subClient.on('message', (channel, message) => {
          this.localBus.emit(`channel:${channel}`, message);
        });

        console.log('✅ Redis Pub/Sub cluster connected successfully.');
        return;
      } catch (err) {
        console.warn('⚠️  Redis unavailable. Using high-speed in-memory Pub/Sub event bus.', (err as Error).message);
        this.isRedisActive = false;
      }
    } else {
      console.log('ℹ️  No external Redis URL provided. Using in-memory Pub/Sub event mesh.');
    }
  }

  public async publish(channel: string, payload: unknown): Promise<void> {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);

    if (this.isRedisActive && this.pubClient) {
      try {
        await this.pubClient.publish(channel, serialized);
        // Also emit locally for immediate loopback
        this.localBus.emit(`channel:${channel}`, serialized);
        return;
      } catch (err) {
        console.error('Redis publish error, emitting to local bus:', err);
      }
    }

    // Fallback: local bus
    this.localBus.emit(`channel:${channel}`, serialized);
  }

  public async subscribe(channel: string, handler: (data: any) => void): Promise<() => void> {
    const eventName = `channel:${channel}`;

    const wrappedHandler = (msg: string) => {
      try {
        const parsed = JSON.parse(msg);
        handler(parsed);
      } catch {
        handler(msg);
      }
    };

    this.localBus.on(eventName, wrappedHandler);

    if (this.isRedisActive && this.subClient) {
      try {
        await this.subClient.subscribe(channel);
      } catch (err) {
        console.error('Redis subscribe error:', err);
      }
    }

    // Return unsubscription teardown function
    return () => {
      this.localBus.off(eventName, wrappedHandler);
      if (this.isRedisActive && this.subClient && this.localBus.listenerCount(eventName) === 0) {
        this.subClient.unsubscribe(channel).catch(() => {});
      }
    };
  }
}

export const pubsub = new PubSubService();
