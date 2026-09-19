# Custom Domain Setup Guide

## How to Connect a Custom Domain to PulseChat (e.g. `chat.yourdomain.com` or `yourdomain.com`)

---

## 1. Domain Architecture Overview
A production real-time chat application requires routing for two traffic types:
1. **Frontend Web Traffic (HTTPS)**: Static HTML, CSS, JavaScript chunks, images, and SEO crawler routes.
2. **Backend API & WebSocket Traffic (WSS)**: REST API calls (`/healthz`, `/api/stats`) and WebSocket upgrade connections (`wss://api.yourdomain.com`).

---

## 2. Recommended DNS Configuration

### Scenario A: Full Stack on a Single Domain with Reverse Proxy (Recommended)
You route everything through `pulsechat.io`, with `/api` and `/ws` proxied to the backend:

| Type | Name / Host | Target / Value | TTL | Proxy Status |
|---|---|---|---|---|
| **A** | `@` | Server Public IPv4 (e.g. `198.51.100.1`) | Auto / 300 | Proxied (Cloudflare) |
| **CNAME** | `www` | `pulsechat.io` | Auto / 300 | Proxied (Cloudflare) |

### Scenario B: Split Subdomains (e.g. Frontend on Vercel/Netlify, Backend on VPS/Render)

| Type | Name / Host | Target / Value | Purpose |
|---|---|---|---|
| **CNAME** | `@` or `chat` | `cname.vercel-dns.com` | Frontend UI |
| **CNAME** | `api` | `pulsechat-backend.onrender.com` | Backend REST + WebSocket |

---

## 3. Reverse Proxy Configuration (Nginx / Caddy)

### Nginx Configuration (`/etc/nginx/sites-available/pulsechat`)
```nginx
server {
    server_name pulsechat.yourdomain.com;

    # Frontend Static Files
    location / {
        root /var/www/pulsechat/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API Endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Real-Time Gateway Upgrade
    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/pulsechat.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pulsechat.yourdomain.com/privkey.pem;
}
```

---

## 4. SSL/TLS Certificate Provisioning (Let's Encrypt / Certbot)
To issue free, auto-renewing SSL certificates for your custom domain:
```bash
sudo certbot --nginx -d pulsechat.yourdomain.com -d www.pulsechat.yourdomain.com
```

---

## 5. Cloudflare CDN Considerations for WebSockets
If using Cloudflare:
1. Ensure **WebSockets** is toggled **ON** in Cloudflare Dashboard -> Network -> WebSockets.
2. In SSL/TLS settings, set mode to **Full (Strict)**.
3. Configure Page Rules to bypass caching for WebSocket paths (`pulsechat.yourdomain.com/ws*`).
