# BookFry Technical Documentation Index

> **Last Updated**: July 29, 2026  
> **Documentation Pass Baseline**: Codebase Audit & Production State Sync Pass

---

## Executive Project Summary

**BookFry** is a production-grade digital marketplace and P2P exchange platform for buying, selling, and trading pre-owned and new academic textbooks, literature, and competitive exam books across India (*"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"*). Built as a monorepo, BookFry features a high-performance Next.js 15 App Router frontend paired with a modular Express/TypeScript backend REST API, backed by MongoDB for persistent document storage, Redis & BullMQ for async jobs and recommendation telemetry, and Razorpay for standard web checkout.

---

## Quick Start Guide

### Prerequisites
- Node.js `^20.0.0`
- pnpm `^9.0.0` or `^10.0.0`
- MongoDB instance (Local `mongodb://localhost:27017/bookfry` or MongoDB Atlas URI)
- Redis server instance (`redis://localhost:6379`)

### Installation & Environment Setup
1. Clone repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables in `apps/api/.env` and `apps/web/.env.local`:
   ```bash
   # apps/api/.env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bookfry
   REDIS_URL=redis://localhost:6379
   JWT_ACCESS_SECRET=your_jwt_access_secret_key_32chars
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_32chars
   RAZORPAY_KEY_ID=rzp_test_key
   RAZORPAY_KEY_SECRET=rzp_test_secret
   RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret

   # apps/web/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_key
   ```

### Development & Verification Commands
```bash
pnpm dev         # Start web storefront (port 3000) & API server (port 5000) concurrently via Turbo
pnpm build       # Run TypeScript build across monorepo packages (@bookmarket/types, @bookmarket/api, @bookmarket/web)
pnpm typecheck   # Run tsc --noEmit check across all 3 packages
pnpm lint        # Run ESLint validation across all package files
pnpm test        # Run unit & integration test suite via Vitest
```

---

## Documentation Directory

| Document | Description |
| :--- | :--- |
| **[ARCHITECTURE.md](file:///c:/Users/mohit/OneDrive/Desktop/project/docs/ARCHITECTURE.md)** | System architecture diagram, real directory structure, and step-by-step data flows for Auth, Checkout, and Order Fulfillment. |
| **[FRONTEND.md](file:///c:/Users/mohit/OneDrive/Desktop/project/docs/FRONTEND.md)** | Web application route map, UI component inventory, Zustand & TanStack Query state mapping, and design token compliance status. |
| **[BACKEND.md](file:///c:/Users/mohit/OneDrive/Desktop/project/apps/api/README.md)** | Comprehensive API endpoint reference, Zod validation schemas, middleware pipeline, and BullMQ background workers schedule. |
| **[DATABASE.md](file:///c:/Users/mohit/OneDrive/Desktop/project/docs/DATABASE.md)** | Complete Mongoose schema documentation, model relationships, declared vs. queried indexes, and schema drift notes. |
| **[IMPLEMENTATION_STATUS.md](file:///c:/Users/mohit/OneDrive/Desktop/project/docs/IMPLEMENTATION_STATUS.md)** | Module-by-module feature status matrix (Done / Partial / Not Started), audit alignment, and codebase TODO/FIXME register. |
| **[SECURITY.md](file:///c:/Users/mohit/OneDrive/Desktop/project/docs/SECURITY.md)** | Security posture evaluation: RBAC coverage, rate-limiting status, input sanitization, JWT lifecycle, and upload validation. |
| **[DEPLOYMENT.md](file:///c:/Users/mohit/OneDrive/Desktop/project/docs/DEPLOYMENT.md)** | Active production build setups, Docker containers, environment variable manifests, and deployment gaps. |
