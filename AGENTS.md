# AGENTS.md — BookFry AI Development & Architecture Rules

This document governs all AI agents (Claude, Cursor, Copilot, Antigravity) working in this codebase. **Read and obey every rule before writing or editing code.**

---

## 1. Project Overview & Source of Truth

**BookFry** — A production marketplace for buying and selling new and used books.
- **Brand Slogan**: *"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"* (Education must never stop).
- **Branding Source of Truth**: `docs/DESIGN.md` (sampling official logo colors: Deep Navy `#1A3B5C` & Fiery Orange `#F26522`).
- **Styling Source of Truth**: `apps/web/src/styles/global.css` (HSL variables compatible with Tailwind / shadcn/ui).

---

## 2. Strict UI & Design System Rules

1. **Strict Design System Compliance**:
   - The AI must **ALWAYS** follow `docs/DESIGN.md`.
   - The AI must **ALWAYS** use CSS variables from `global.css` via Tailwind tokens (`bg-background`, `text-foreground`, `bg-primary`, `bg-secondary`, `border-border`).
   - **NEVER hardcode colors** or raw hex values (`#1A3B5C`, `#FFFFFF`, `#000000`) inside components.
   - **NEVER invent ad-hoc spacing**, margins, typography scale, shadows, border radiuses, or custom gradients. Use predefined design tokens only.

2. **Component Reusability & Search First**:
   - **Always search existing components** before creating new ones (`grep_search` / `list_dir`).
   - **Never create a component if one already exists**. Reuse and compose.
   - Every new page must reuse existing design system components (`BookCard`, `BookCarousel`, `Navbar`, `Footer`, `AnnouncementBar`, `QuickFilterBar`).
   - Never duplicate UI patterns.

3. **Component & Function Size Caps**:
   - **Maximum Component Size**: 250 lines. If a component exceeds 250 lines, split it into smaller focused sub-components.
   - **Maximum Function Size**: 50 lines. Extract reusable logic into custom hooks (`/hooks`) or service utilities (`/lib`).

4. **Required 4-State UI Coverage**: Every screen, section, or card module MUST implement all 4 states:
   - **Loading State**: Exact skeleton representation matching component dimensions (e.g., `<SkeletonBookCard />`).
   - **Error State**: User-friendly error message with retry trigger.
   - **Empty State**: Clear illustration/icon + single-sentence explanation + primary action button.
   - **Responsive State**: Mobile-first design working seamlessly from 320px to 1536px+.

5. **Accessibility & Focus Management**:
   - Keyboard navigable controls (`focus-ring`).
   - Explicit `aria-label` or `alt` attributes on all interactive and image elements.

---

## 3. Architecture & Code Quality Conventions

- **SOLID, DRY, KISS**: Prefer composition over inheritance. Keep modules single-purpose.
- **React Server Components (RSC)**: Use Server Components by default; add `"use client"` ONLY when interactivity/state is required.
- **State Management**:
  - **Server State**: TanStack Query (`useQuery`, `useMutation`). **NEVER use `useEffect` + `fetch` for API data fetching.**
  - **Client State**: Zustand stores (`useAuthStore`, `useCartStore`).
- **Image Optimization**: Always use `next/image` for static/remote image assets with fallback handling.
- **Backend Layering**: `Route → Controller → Service → Repository → Model`. Controllers must never touch Mongoose models directly.
- **Validation**: All API inputs validated at route boundaries with `zod`.

---

## 4. Commands for Verification

```bash
pnpm lint        # ESLint check across monorepo
pnpm typecheck   # TypeScript tsc --noEmit check across monorepo
pnpm test        # Run unit tests
pnpm build       # Full Next.js + API production build
```

**Rule**: Never mark a task completed without running `pnpm typecheck` and `pnpm build`.
