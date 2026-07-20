# Master Build Prompt — BookMarket

Use this prompt with Claude Code (or any AI coding agent) inside the repo, after `AGENTS.md`, `DESIGN.md`, and `IMPLEMENTATION_PLAN.md` are in `docs/` at the repo root. Paste as-is, or split into per-phase prompts (recommended for a production build — see "How to use this" below).

---

## How to use this

Don't paste this whole prompt and expect one working app in one shot. Production-quality output comes from running it **phase by phase**, reviewing/testing after each phase, then continuing. The prompt below is written so you can either:

1. Paste it in full as a project brief, then separately say "Start with Phase 1 only," or
2. Copy just the "Phase N" section for each work session.

---

## The prompt

```
You are acting as a Principal Full-Stack Engineer building a production marketplace
application called BookMarket — a platform to buy and sell new and used books.

Before writing any code, read these three files in this repo and treat them as the
binding spec:
- docs/AGENTS.md            (conventions, folder structure, non-negotiables)
- docs/DESIGN.md             (design tokens, components, UX patterns)
- docs/IMPLEMENTATION_PLAN.md (roles, DB schema, API surface, phased plan)

STACK (fixed — do not substitute):
- Frontend: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui,
  TanStack Query, Zustand, Framer Motion
- Backend: Node.js, Express.js, TypeScript, MongoDB + Mongoose, Redis, BullMQ
- Auth: JWT (access + refresh, httpOnly cookies)
- Storage: Cloudinary
- Monorepo: pnpm workspaces + Turborepo

RULES:
1. Follow the folder structure in IMPLEMENTATION_PLAN.md §2 exactly.
2. Backend must follow strict layering: route -> controller -> service ->
   repository -> model. Never query Mongoose directly from a controller.
3. Every API input is validated with zod at the route boundary. Every API
   response follows the envelope defined in IMPLEMENTATION_PLAN.md §4.
4. Every list/detail UI must implement loading, empty, and error states —
   not just the happy path.
5. Use the exact color/type/spacing tokens from DESIGN.md. Do not invent
   new values.
6. Write TypeScript in strict mode. No `any` without a comment justifying it.
7. Write unit tests for services/utils and integration tests for new API
   routes as you build them — not as an afterthought.
8. After each phase, give me: (a) a list of files created/changed,
   (b) how to run/verify it locally, (c) what's intentionally deferred
   to a later phase.
9. If a requirement is ambiguous, make the most sensible production-grade
   assumption, state it explicitly, and continue — don't stall on it.

Do NOT start building everything at once. Wait for me to specify which
phase to build (Phase 1–6, as defined in IMPLEMENTATION_PLAN.md §12).

Confirm you've read all three docs and summarize the Phase 1 scope back
to me before writing any code.
```

---

## Suggested phase kickoff prompts

Once the agent has confirmed it read the docs, drive it one phase at a time:

**Phase 1 — Foundation**
```
Build Phase 1: monorepo scaffold (pnpm + turborepo), shared packages/types
and packages/config, Tailwind config wired to DESIGN.md tokens (light +
dark mode), base app shell (navbar, footer, layout) in apps/web, and the
full auth module in apps/api (register, login, refresh, logout, email
verification, forgot/reset password) with the User model. Include a
docker-compose.yml for local Mongo + Redis, .env.example for both apps,
and a GitHub Actions workflow that runs lint + typecheck + unit tests on
every PR.
```

**Phase 2 — Core marketplace**
```
Build Phase 2: Book and Category models + full CRUD API (seller-owned
books, admin-owned categories), Cloudinary image upload pipeline with
server-side validation, the book search/filter/listing page and book
detail page in apps/web using the design specs in DESIGN.md §11, and the
cart module (model + API + Zustand store + UI).
```

**Phase 3 — Transactions**
```
Build Phase 3: checkout flow (shipping -> payment -> review), the
PaymentProvider abstraction with one concrete implementation (state which
provider you're using and why), Order model + lifecycle API, order
tracking UI for customers, and the seller order-fulfillment dashboard.
```

**Phase 4 — Trust & engagement**
```
Build Phase 4: reviews & ratings (with proof-of-purchase enforcement),
wishlist module, in-app + email notifications (BullMQ), and the seller
analytics dashboard (revenue, active listings, pending orders, rating).
```

**Phase 5 — Admin & hardening**
```
Build Phase 5: full admin dashboard (users, listings, categories, orders,
reports, CMS for homepage sections), then a security hardening pass:
rate limiting on all mutating/auth routes, helmet config, Mongo sanitize
middleware, CSRF protection, and a review of every route for correct RBAC.
```

**Phase 6 — Polish & launch**
```
Build Phase 6: accessibility audit and fixes against WCAG 2.1 AA, SEO
pass (SSR/ISR, sitemap, structured data, OG tags), Playwright E2E suite
for the critical paths, and production deployment configs for Vercel
(web) and Docker/Nginx (api).
```

---

## Tips

- Keep `docs/` up to date as the agent builds — if it deviates from the plan for a good reason, update the doc in the same session so it stays the source of truth.
- Ask the agent to open a PR (or diff) per phase rather than committing straight to `main`, even if you're the only developer — it forces a review checkpoint.
- If using Claude Code specifically, `AGENTS.md` at the repo root is read automatically as project context — keep it current as the single most important file in the repo.
