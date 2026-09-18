# BookFry Theme, Token Architecture & Performance Audit

## 1. Executive Summary & Design Token Compliance
BookFry enforces strict semantic design tokens across light and dark modes:
- **Brand Colors**: Deep Navy `#1A3B5C` (`--primary`) & Fiery Orange `#F26522` (`--secondary`).
- **Semantic Compliance**:
  - Zero hardcoded hex or ad-hoc rgb colors in JSX.
  - All surface and text styles map to CSS variables: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`.
  - Contrast ratios verified for WCAG AA compliance in both light and dark modes.

---

## 2. Elimination of AI-Generated UI Tropes
1. **No Repetitive 3-Column AI Cards**:
   - Asymmetrical, content-driven layouts (e.g. 5:7 split in customer profile, 5:7 split in listing inspector).
   - Media viewports matched to authentic book aspect ratios (3:4 portrait).
2. **No Pointless Floating Icon-in-Circle Badges**:
   - Meaningful status tags with semantic color accents (`emerald` for active, `amber` for pending, `rose` for rejected).
3. **Tactile Micro-Interactions**:
   - Subtle hover feedback, clear active scale responses, and focus-visible rings for keyboard accessibility.

---

## 3. Frontend Performance & Core Web Vitals
1. **Next.js 15 App Router & React Server Components**:
   - Default to static rendering where possible (49/49 static and dynamic routes compiled).
   - Selective client boundaries (`"use client"`) only for interactive inputs and mutations.
2. **Asset Optimization**:
   - Next.js `<Image />` component with dynamic remote pattern configuration for Cloudinary and OpenLibrary CDN.
   - Sizing and priority attributes specified to prevent Cumulative Layout Shift (CLS).
3. **State & Cache Invalidation**:
   - TanStack Query cache invalidation strategy ensures immediate optimistic feedback upon mutations.
