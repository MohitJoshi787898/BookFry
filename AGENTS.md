# AGENTS.md — BookFry Production AI Engineering Handbook & Source of Truth

This document is the **single, mandatory source of truth** governing all AI coding assistants (Claude, Cursor, Copilot, Antigravity) working in the **BookFry** monorepo. Every rule in this document must be strictly obeyed without exception.

---

## 1. Executive Summary & Core Source of Truth

**BookFry** is a production-grade digital marketplace for buying, selling, and exchanging new and used books across India.
- **Brand Slogan**: *"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"* (*Education must never stop*).
- **Default Application Titles**:
  - `BookFry • Buy & Sell Books`
  - `BookFry • India's Book Marketplace`
  - `BookFry • Because Learning Never Stops`

### Mandatory Reading Order Before Writing Any Code:
Before modifying or creating any file, every AI agent **MUST** read and obey:
1. `docs/DESIGN.md` — Branding, official logo colors (Deep Navy `#1A3B5C` & Fiery Orange `#F26522`), typography, and design tokens.
2. `docs/IMPLEMENTATION_PLAN.md` (or project implementation plan artifact) — Feature design, architecture, and step-by-step roadmap.
3. `apps/web/src/styles/global.css` (or `globals.css`) — Active HSL design tokens, color variables, spacing scale, border radiuses, shadows, and utility classes.

---

## 2. Technology Stack & Framework Standards

| Domain | Technology Stack |
| :--- | :--- |
| **Web Framework** | Next.js 15 (App Router with React Server Components) |
| **Backend Layer** | Node.js, Express.js (Layered Architecture: Route → Controller → Service → Repository → Model) |
| **Database** | MongoDB via Mongoose |
| **Language** | TypeScript (Strict Mode across monorepo) |
| **Styling & UI Components** | TailwindCSS + shadcn/ui + Custom CSS Variables in `global.css` |
| **Client State** | Zustand (`useAuthStore`, `useCartStore`, `useAuthModalStore`) |
| **Server State & Data Fetching** | TanStack Query (`useQuery`, `useMutation`) — **NEVER use `useEffect` + `fetch` for API data fetching** |
| **Animations & Motion** | Framer Motion (Smooth, accessible micro-interactions) |
| **Form Management & Validation** | React Hook Form + Zod Validation Schemas |

---

## 3. Strict Design System & Styling Rules

1. **CSS Variables & Token Compliance**:
   - **ALWAYS** reference CSS variables from `global.css` via Tailwind tokens (`bg-background`, `bg-surface`, `bg-brand`, `bg-secondary`, `text-text-primary`, `text-text-secondary`, `border-border`, `ring-ring`).
   - **NEVER hardcode raw colors** (hex `#1A3B5C`, `#FFFFFF`, `#000000`, `rgb()`, `rgba()`) inside JSX or inline styles.
   - **NEVER use ad-hoc Tailwind colors** (e.g. `bg-blue-500`, `text-red-600`, `bg-slate-900`).
2. **Spacing, Typography & Radius Rules**:
   - Use predefined typography scale (`font-sans`, `font-serif`, `font-mono`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-h1`, `text-h2`).
   - Use standard border-radius tokens (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`).
   - Use standard shadow tokens (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-2xl`, `book-card-shadow`).
3. **Tactile BookFry Micro-Interactions**:
   - Use `.hover-page-turn` for tactile book card elevation (`hover:-translate-y-1 hover:rotate-1`).
   - Use `.bookmark-badge` ribbon styles for condition, discount, and status tags.

---

## 4. Reusable Component Catalog & Architecture

### Rule: Search First & Reuse existing components
Before creating any UI element, search the codebase (`grep_search` / `list_dir`) for existing components. **Never duplicate UI code.**

### Shared Component Hierarchy:
Every page must be composed of reusable components located inside `apps/web/src/components/`:
- **Header & Navigation**: `AnnouncementBar`, `Navbar`, `SearchBar`, `QuickFilterBar`
- **Marketing & Hero**: `HeroSection`, `CategoryGrid`, `WhyBookFrySection`, `ExchangeKnowledgeSection`, `ReadingJourneyCTA`
- **Carousels & Grids**: `BookCarousel`, `BookGrid`, `BookCard`, `FeaturedBooks`, `TrendingBooks`, `BookList`
- **Profiles & Reviews**: `AuthorCard`, `SellerCard`, `ReviewSection`, `Testimonials`
- **Content & Conversion**: `Newsletter`, `FAQ`, `FilterSidebar`, `Pagination`, `BookDetails`, `RecommendationSection`
- **Footer**: `Footer`

### Separation of Concerns:
- **UI Components**: Purely visual presentation layer.
- **Business & Domain Logic**: Must live inside custom hooks (`/hooks`), service utilities (`/lib`), or Zustand/TanStack Query stores. Never inline complex data fetching or state orchestration inside visual UI components.

---

## 5. Comprehensive UI State Coverage (Required 8-State Pattern)

Every screen, page, card module, or data-driven component **MUST** implement full UI coverage across all 8 potential operational states:

1. **Loading State**: High-fidelity skeleton representation matching exact component dimensions (e.g. `<SkeletonBookCard />`, `<BookGridSkeleton />`, `<CartSkeleton />`). **Avoid generic loading spinners.**
2. **Success / Content State**: Fully rendered, responsive component layout.
3. **Empty State**: Clear visual illustration/icon + single-sentence explanation + primary call-to-action button (e.g. "No books found in this category. Browse All Books").
4. **Error / Failure State**: User-friendly error message + clear "Try Again" retry trigger button.
5. **Offline State**: Connection loss banner or offline cached notification.
6. **No Results State**: Help message suggesting search keyword relaxation or filter clearing.
7. **Permission Denied / Auth Required State**: Informative banner or trigger for the **Premium Authentication Modal** (`useAuthModalStore`).
8. **Network Timeout / Retry State**: Gentle notification with automatic or manual retry trigger.

---

## 6. SEO, Schema & Metadata Best Practices

Every page generated or edited in Next.js must include comprehensive SEO optimization:

1. **Next.js Metadata API**:
   - Generate static metadata or `generateMetadata()` for dynamic routes (`/books/[slug]`).
   - Define `title`, `description`, `keywords`, `robots`, `alternates.canonical`.
   - Include Open Graph (`og:title`, `og:description`, `og:image`, `og:type`, `og:site_name`) and Twitter Card metadata (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
2. **Structured Data (JSON-LD Schemas)**:
   - Inject rich JSON-LD schema objects (`Book`, `Product`, `BreadcrumbList`, `Organization`, `WebSite`, `Person`/`Author`).
3. **Semantic HTML & Heading Structure**:
   - Exactly **one `<h1>` tag** per page containing primary target keywords.
   - Strict heading hierarchy (`h1` → `h2` → `h3` → `h4`).
   - Semantic HTML5 tags (`<main>`, `<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`, `<aside>`).
4. **Accessible Images & Crawlability**:
   - Explicit, descriptive `alt` text on every image.
   - Dynamic `sitemap.xml` and `robots.txt` support.

---

## 7. Favicon, PWA & Brand Asset Guidelines

- **Brand Source**: Use official BookFry logo and vector assets.
- **Favicon & Icons**:
  - `favicon.ico`
  - Apple Touch Icon (`apple-touch-icon.png`)
  - PWA Manifest Icons (`icon-192.png`, `icon-512.png`)
  - Open Graph & Twitter Social Preview Banner (`og-image.png`)
  - Splash Screen & Browser Theme Color (`#1A3B5C` / `#F26522`)
- **Rule**: **NEVER** leave default Vercel or Next.js favicons/logos in production.

---

## 8. Performance & Core Web Vitals Optimization

1. **Image Optimization (`next/image`)**:
   - **ALWAYS** use Next.js `<Image />` component for local and remote image assets.
   - Specify explicit `width`, `height`, `sizes`, and `priority` for above-the-fold hero images.
   - Provide graceful fallback images on loading error.
2. **React Server Components (RSC)**:
   - Default to Server Components for static rendering and server-side data fetching.
   - Add `"use client"` **ONLY** when interactivity, client hooks, or event listeners are required.
3. **Lazy Loading & Code Splitting**:
   - Dynamic import (`next/dynamic`) for heavy interactive components, modals, illustrations, and carousels.
4. **Bundle & Rendering Efficiency**:
   - Memoize expensive calculations (`useMemo`, `useCallback`).
   - Avoid unnecessary re-renders across Zustand store subscriptions by using shallow selectors.
   - Enable route prefetching and streaming (`React.Suspense`) where beneficial.

---

## 9. Accessibility (a11y) & Motion Standards

1. **Keyboard & Focus Navigation**:
   - Full keyboard accessibility for all interactive elements (Tab, Enter, Space, Escape).
   - Focus management and focus trapping in dialogs/modals.
   - Visible, distinct focus ring styling (`focus:ring-2 focus:ring-brand focus:outline-none`).
2. **Screen Readers & ARIA**:
   - Explicit `aria-label`, `aria-expanded`, `aria-controls`, and `aria-hidden` attributes.
   - Screen-reader skip link (`Skip to main content`).
3. **Framer Motion Guidelines**:
   - Use subtle, polished animations (`fade`, `slide`, `scale`, `staggerChildren`).
   - Respect user accessibility preferences (`prefers-reduced-motion`).
   - Avoid overly dramatic or distracting transitions.

---

## 10. Authentication Flow & Modal Rules

When an unauthenticated user triggers seller or account actions (*Sell Books*, *List a Book*, *Manage Listings*):
1. **No Jarring Page Redirects**: Open the **Premium Authentication Modal** (`useAuthModalStore`) directly inside the current flow.
2. **Single-Window Flow Support**:
   - Login Screen (Email, Password, Remember Me, Forgot Password trigger, Submit).
   - Signup Screen (Name, Email, Password, Password Strength Meter, Terms Check).
   - Forgot Password Screen (Email input + Link Sent Success Screen).
   - Email Verification Screen (Inbox check + 60s Resend Timer).
   - Reset Password Screen (New Password + Confirm Password + Strength Rules).
3. **Real-time Password Strength Meter**: Required on all signup and password reset forms.

---

## 11. Backend Layering & Security Conventions

1. **Strict Layering Architecture**:
   - `Route → Controller → Service → Repository → Model`
   - Controllers handle HTTP request/response mapping only.
   - Controllers **MUST NEVER** touch Mongoose models directly. Business logic belongs in Services.
2. **Input Validation**:
   - Validate all API inputs (`body`, `query`, `params`) at route boundaries using `zod`.
3. **Security Best Practices**:
   - Secure JWT token handling (httpOnly cookies for refresh tokens).
   - Password hashing via `bcryptjs` (min salt rounds 12).
   - Prevent email enumeration and leak of sensitive DB fields.

---

## 12. Component & Function Limits

- **Maximum Component Size**: **250 lines**. If a component exceeds 250 lines, decompose it into smaller sub-components.
- **Maximum Function Size**: **50 lines**. Extract complex helper logic into service modules or custom hooks.

---

## 13. Documentation Maintenance Rule

Whenever any of the following items are modified, the AI agent **MUST** update the relevant project documentation:
- API Routes or Contract payloads → Update API docs.
- MongoDB Models / Database Schemas → Update Architecture docs.
- Environment Variables (`.env`) → Update README / setup guide.
- Design System tokens / Colors → Update `docs/DESIGN.md`.

---

## 14. Verification Commands & Pre-Completion Checklist

### Verification Commands:
```bash
pnpm lint        # Run ESLint check across all monorepo packages
pnpm typecheck   # Run TypeScript tsc --noEmit check across monorepo
pnpm test        # Run unit & integration test suite
pnpm build       # Execute full Next.js + Express production build
```

### Pre-Completion Checklist (MUST ALL PASS BEFORE MARKING COMPLETE):
- [ ] `✓ No duplicate code`
- [ ] `✓ No duplicate components (Searched existing codebase)`
- [ ] `✓ Reused existing design system tokens and shared UI`
- [ ] `✓ Fully responsive (320px to 1536px+)`
- [ ] `✓ Accessible (ARIA labels, focus ring, keyboard navigation)`
- [ ] `✓ SEO optimized (Metadata API, heading hierarchy, alt text)`
- [ ] `✓ Loading skeleton exists and matches component layout`
- [ ] `✓ Empty state exists with action button`
- [ ] `✓ Error & retry state exists`
- [ ] `✓ Mobile optimized (Touch targets, mobile drawer/bottom sheet)`
- [ ] `✓ Dark mode supported via CSS variables`
- [ ] `✓ ESLint check passes (pnpm lint)`
- [ ] `✓ TypeScript check passes (pnpm typecheck)`
- [ ] `✓ Production build passes cleanly (pnpm build)`
