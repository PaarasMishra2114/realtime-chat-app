import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { WebSocket } from 'ws';
import { server } from '../src/server.js';

describe('PulseChat Real-Time Backend & WebSocket Integration Tests', () => {
  before(async () => {
    // Give bootstrap time to connect database and bind port
    await new Promise((resolve) => setTimeout(resolve, 800));
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  test('REST API: Health check returns 200 OK', async () => {
    const res = await fetch(`http://localhost:3001/healthz`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'healthy');
  });

  test('REST API: Get available chat rooms', async () => {
    const res = await fetch(`http://localhost:3001/api/rooms`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 4);
    assert.ok(body.data.some((r: any) => r.id === 'general'));
  });

  test('WebSocket: Authentication, Room Join, and Message Broadcast', async () => {
    const ws = new WebSocket(`ws://localhost:3001/ws`);

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => resolve());
      ws.on('error', reject);
    });

    // 1. Send AUTH
    ws.send(JSON.stringify({
      type: 'AUTH',
      payload: {
        userId: 'test-user-1',
        username: 'TestRunner',
        avatar: '🧪'
      }
    }));

    const authResp = await new Promise<any>((resolve) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'AUTH_SUCCESS') {
          resolve(msg);
        }
      });
    });

    assert.strictEqual(authResp.payload.user.username, 'TestRunner');

    // 2. Join Room
    ws.send(JSON.stringify({
      type: 'JOIN_ROOM',
      payload: { roomId: 'general' }
    }));

    const historyResp = await new Promise<any>((resolve) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'ROOM_HISTORY') {
          resolve(msg);
        }
      });
    });

    assert.strictEqual(historyResp.payload.roomId, 'general');
    assert.ok(Array.isArray(historyResp.payload.messages));

    // 3. Send Message
    const testText = `Automated message at ${Date.now()}`;
    ws.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      payload: {
        roomId: 'general',
        text: testText
      }
    }));

    const newMsgResp = await new Promise<any>((resolve) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'NEW_MESSAGE' && msg.payload.text === testText) {
          resolve(msg);
        }
      });
    });

    assert.strictEqual(newMsgResp.payload.text, testText);
    assert.strictEqual(newMsgResp.payload.username, 'TestRunner');

    ws.close();
  });
});
