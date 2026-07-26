# AGENTS.md — BookMarket

This file tells AI coding agents (Claude Code, Cursor, Copilot Workspace, etc.) how to work in this repository. Read this before touching any code.

## 1. What this project is

**BookMarket** — a production marketplace where individuals buy and sell new & used books. Three roles: `customer`, `seller`, `admin`. Monorepo with a Next.js frontend and a Node/Express API, backed by MongoDB.

Not a CRUD toy. Treat every module as production software: validate inputs, handle edge cases, write tests, think about scale and security before writing code.

## 2. Tech stack (source of truth)

| Layer          | Choice                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Frontend       | Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui                                                  |
| Frontend state | Zustand (client state), TanStack Query (server state/cache)                                                  |
| Animation      | Framer Motion                                                                                                |
| Backend        | Node.js 20+, Express.js, TypeScript                                                                          |
| Database       | MongoDB (Atlas), Mongoose ODM                                                                                |
| Cache/Queue    | Redis, BullMQ (email, notifications, image processing jobs)                                                  |
| Auth           | JWT (access + refresh), httpOnly cookies                                                                     |
| File storage   | Cloudinary (book cover images)                                                                               |
| Realtime       | Socket.io (order status, seller notifications, chat — future)                                                |
| Payments       | Razorpay Standard Web Checkout (active via NEXT_PUBLIC_RAZORPAY_KEY_ID; backend verification runs inside MongoDB transactions) |
| Deployment     | Frontend → Vercel. Backend → Docker container on Railway/Render/EC2. DB → MongoDB Atlas.                     |
| Testing        | Vitest/Jest (unit), Supertest (API), Playwright (E2E)                                                        |

Do not introduce a new library/framework without updating this table and stating the reason.

## 3. Monorepo layout

```
book-market/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Express backend
├── packages/
│   ├── config/               # shared eslint/tsconfig/tailwind config
│   ├── types/                 # shared TS types/DTOs used by web + api
│   └── ui/                    # shared design-system components (optional, phase 2)
├── docs/
│   ├── DESIGN.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── api/                   # OpenAPI spec, Postman collection
├── .github/workflows/         # CI/CD
├── docker-compose.yml          # local mongo + redis
├── AGENTS.md
├── package.json                # workspaces root (pnpm)
└── turbo.json                  # Turborepo pipeline (build/lint/test)
```

Use **pnpm workspaces + Turborepo**. Do not mix npm/yarn lockfiles into the repo.

See `IMPLEMENTATION_PLAN.md` for the full `apps/web` and `apps/api` internal folder structures.

## 4. Commands an agent should know

```bash
pnpm install                 # install all workspaces
pnpm dev                     # run web + api concurrently (turbo)
pnpm --filter web dev        # frontend only
pnpm --filter api dev        # backend only
pnpm lint                    # eslint across repo
pnpm typecheck                # tsc --noEmit across repo
pnpm test                    # unit tests
pnpm test:e2e                # playwright
pnpm build                   # production build, all apps
docker compose up -d         # local mongo + redis
```

Never mark a task done without running `pnpm lint`, `pnpm typecheck`, and relevant tests.

## 5. Coding conventions

- **Language**: TypeScript everywhere. `strict: true`. No `any` unless justified with a comment.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components/classes/types, `kebab-case` for file and folder names, `UPPER_SNAKE_CASE` for constants/env vars.
- **Backend architecture**: strict layering — `route → controller → service → repository → model`. Controllers never touch Mongoose models directly. Business logic lives in services, not controllers.
- **Validation**: every API input validated at the route boundary with `zod`. Never trust `req.body`/`req.query`/`req.params` unvalidated.
- **Errors**: throw typed `AppError` subclasses (`NotFoundError`, `ValidationError`, `UnauthorizedError`, etc.), caught by a single centralized Express error-handling middleware. No raw `throw new Error("x")` in business logic.
- **Responses**: every API response follows the standard envelope in `DESIGN.md` / `IMPLEMENTATION_PLAN.md` §17. Don't invent ad-hoc shapes.
- **Frontend data fetching**: use TanStack Query for all server data. No `useEffect` + `fetch` data-fetching patterns.
- **Components**: Server Components by default; add `"use client"` only when interactivity/state is required. Break down screens into small, single-responsibility reusable components (e.g. `AnnouncementBar`, `BookCard`, `BookCarousel`, `QuickFilterBar`, `CategoryGrid`, `TestimonialsSection`, `NewsletterSection`).
- **Design System & Styling**: Follow tokens and principles in `DESIGN.md`. Use CSS variables in `globals.css` via Tailwind design tokens (`bg-background`, `text-text-primary`, `bg-brand`, `text-accent`, etc.). Never hardcode hex colors in UI components. Always include skeleton loaders, empty states, and responsive styling for both Light and Dark modes.
- **User Session Persistence**: On boot, the frontend checks if `isAuthenticated` is true, querying `/auth/me` to sync the latest database profile details. If this query fails with a 401, it clears local credentials automatically to maintain sync.
- **Secrets**: never commit `.env`. Add new env vars to `.env.example` in the same PR.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`).

## 6. Security non-negotiables

- All mutating routes require auth middleware; role-gated routes require RBAC middleware.
- Rate-limit auth endpoints and search endpoints.
- Sanitize all user-generated HTML (reviews, descriptions) before render/store.
- File uploads: validate MIME type + size server-side before forwarding to Cloudinary; never trust client-reported type.
- No secrets, tokens, or PII in logs.

## 7. What an agent should do before starting a task

1. Read `docs/IMPLEMENTATION_PLAN.md` for the module's scope, DB schema, and API contract.
2. Check `packages/types` for existing shared types before defining new ones.
3. Check if a similar module already exists to mirror its pattern (e.g., build `Wishlist` the way `Cart` was built).
4. Write/update tests alongside the code, not after.
5. Update `docs/api/` (OpenAPI) if you add/change an endpoint.

## 8. What an agent should never do

- Never bypass the service layer to query Mongoose directly from a controller/route.
- Never hardcode a payment provider's SDK calls inside a controller — go through the `PaymentProvider` interface.
- Never introduce global mutable state on the backend (keep it stateless; use Redis for shared state).
- Never ship a feature without loading/empty/error states on the frontend.
- Never skip input validation "because it's an internal admin route."
