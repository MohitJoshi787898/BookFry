# Production Deployment Guide & Infrastructure Manifest

---

## 1. Local & Containerized Infrastructure Setup

BookFry provides a local containerized environment via `docker-compose.yml` provisioned with MongoDB 7.0 and Redis 7.2 Alpine.

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: bookmarket-mongodb
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7.2-alpine
    container_name: bookmarket-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Launching Local Containers
```bash
docker compose up -d
```

---

## 2. Environment Variable Manifests

### Backend REST API (`apps/api/.env`)

| Variable Key | Purpose | Required / Optional | Sample Value |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP Server Listener Port | Optional (Default: 5000) | `5000` |
| `NODE_ENV` | Runtime environment flag | Required | `production` / `development` |
| `MONGODB_URI` | MongoDB Connection String | Required | `mongodb://localhost:27017/bookfry` |
| `REDIS_URL` | Redis Connection String | Required for Queues | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret key for access token signing | Required | `min_32_chars_secret_key` |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | Required | `min_32_chars_refresh_key` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | Required for Payments | `rzp_live_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | Required for Payments | `secret_xxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification signature secret | Required for Webhooks | `whsec_xxxxxxxx` |
| `RESEND_API_KEY` | Resend API Key for emails | Optional (Fallback to SMTP/Console) | `re_123456789` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Storage Account Name | Optional (Image uploads) | `bookfry-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Optional | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Optional | `api_secret` |

### Web Frontend (`apps/web/.env.local`)

| Variable Key | Purpose | Required / Optional | Sample Value |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend REST API endpoint base URL | Required | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay Key for web checkout modal | Required | `rzp_live_xxxxxxxx` |

---

## 3. Production Deployment Architecture Options

### Option A: Vercel + Railway / Render (Recommended Cloud Setup)
1. **Frontend (`apps/web`)**: Deploy to Vercel as a Next.js application. Set Root Directory to `apps/web`. Configure `NEXT_PUBLIC_API_URL` pointing to backend API server.
2. **Backend API (`apps/api`)**: Deploy to Render / Railway / AWS ECS. Build command: `pnpm --filter @bookmarket/api build`, Start command: `node apps/api/dist/server.js`.
3. **Database & Cache**: MongoDB Atlas M10+ cluster, Upstash or Redis Enterprise instance.

### Option B: Unified Docker Container Deployment
- Run `apps/api` server with `worker-runner.ts` initialized internally on boot (`apps/api/src/server.ts`).

---

## 4. Configured vs. Pending Setup Gaps

- **Configured**:
  - `docker-compose.yml` for MongoDB 7.0 and Redis 7.2 Alpine.
  - Turbo monorepo build pipeline (`pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`).
  - Standalone BullMQ worker runner script (`apps/api/src/jobs/workers/worker-runner.ts`).
  - Bull Board administrative dashboard mounted at `/api/v1/admin/queues`.
- **Pending / Future Setup**:
  - Production `Dockerfile` per package in `apps/web` and `apps/api`.
  - GitHub Actions CI workflow configuration (`.github/workflows/ci.yml`).
