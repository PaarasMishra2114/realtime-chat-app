import assert from 'node:assert';
import { WebSocket } from 'ws';

async function verifyAll() {
  console.log('🧪 Starting Full System E2E & SEO Verification Audit...');

  // 1. Frontend Root
  console.log('1. Checking Frontend HTML and SEO Head Tags...');
  const feRes = await fetch('http://localhost:5173/');
  assert.strictEqual(feRes.status, 200);
  const html = await feRes.text();
  assert.ok(html.includes('PulseChat'), 'Title includes PulseChat');
  assert.ok(html.includes('og:image'), 'Open Graph image meta tag present');
  assert.ok(html.includes('twitter:card'), 'Twitter card meta tag present');
  assert.ok(html.includes('rel="canonical"'), 'Canonical tag present');
  assert.ok(html.includes('SoftwareApplication'), 'JSON-LD Schema present');
  assert.ok(html.includes('favicon.svg'), 'Favicon reference present');
  console.log('  ✅ Frontend HTML, Open Graph, and Structured Data verified.');

  // 2. Static SEO and Crawler Assets
  console.log('2. Checking Search Engine & AI Crawler Files...');
  const favRes = await fetch('http://localhost:5173/favicon.svg');
  assert.strictEqual(favRes.status, 200);
  assert.ok((await favRes.text()).includes('<svg'), 'Favicon SVG valid');

  const ogRes = await fetch('http://localhost:5173/og-image.svg');
  assert.strictEqual(ogRes.status, 200);
  assert.ok((await ogRes.text()).includes('1200'), 'OG Image Dimensions valid');

  const robotsRes = await fetch('http://localhost:5173/robots.txt');
  assert.strictEqual(robotsRes.status, 200);
  assert.ok((await robotsRes.text()).includes('Sitemap:'), 'Robots.txt links to sitemap');

  const sitemapRes = await fetch('http://localhost:5173/sitemap.xml');
  assert.strictEqual(sitemapRes.status, 200);
  assert.ok((await sitemapRes.text()).includes('<urlset'), 'Sitemap XML valid');

  const llmsRes = await fetch('http://localhost:5173/llms.txt');
  assert.strictEqual(llmsRes.status, 200);
  assert.ok((await llmsRes.text()).includes('PulseChat'), 'LLMS.txt valid');
  console.log('  ✅ Favicon, OG Image, robots.txt, sitemap.xml, and llms.txt verified.');

  // 3. Backend REST Endpoints
  console.log('3. Checking Backend REST Health & Data APIs...');
  const healthRes = await fetch('http://localhost:3001/healthz');
  assert.strictEqual(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.status, 'healthy');

  const roomsRes = await fetch('http://localhost:3001/api/rooms');
  assert.strictEqual(roomsRes.status, 200);
  const roomsJson = await roomsRes.json();
  assert.ok(roomsJson.data.length >= 4, 'Rooms seeded');
  console.log(`  ✅ Backend healthy with ${roomsJson.data.length} active channels.`);

  // 4. WebSocket Live Real-Time Test
  console.log('4. Checking Real-Time WebSocket Bi-Directional Transport...');
  const ws = new WebSocket('ws://localhost:3001/ws');
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  // Auth
  ws.send(JSON.stringify({
    type: 'AUTH',
    payload: { userId: 'e2e-tester', username: 'AuditAgent', avatar: '🕵️' }
  }));

  await new Promise((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'AUTH_SUCCESS') resolve(msg);
    });
  });

  // Join dev channel
  ws.send(JSON.stringify({
    type: 'JOIN_ROOM',
    payload: { roomId: 'dev' }
  }));

  await new Promise((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ROOM_HISTORY') resolve(msg);
    });
  });

  // Send message
  const testMsg = 'Audit complete: all systems nominal 🚀';
  ws.send(JSON.stringify({
    type: 'SEND_MESSAGE',
    payload: { roomId: 'dev', text: testMsg }
  }));

  const received = await new Promise((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'NEW_MESSAGE' && msg.payload.text === testMsg) {
        resolve(msg);
      }
    });
  });

  assert.strictEqual(received.payload.text, testMsg);
  console.log('  ✅ WebSocket Auth, Room Subscription, and Real-Time Broadcast verified.');

  ws.close();
  console.log('\n🎉 ALL 4 AUDIT PHASES PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

verifyAll().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
