# DESIGN.md — BookFry Design System & Visual Specification

This document is the **single source of truth** for all visual, architectural, and component-level decisions across **BookFry**. It is derived directly from the official **BookFry** logo identity.

---

## 1. Brand Philosophy & Identity

BookFry is a modern, student-friendly, community-driven marketplace for buying, selling, and circulating new and used books.

### Brand Pillars
1. **Knowledge & Trust**: Represented by the deep navy blue foundation of the wordmark and book base. Reliable, academic, secure.
2. **Ignition & Growth**: Represented by the fiery orange and warm sun-gold flame rising from the open book. Passion for reading, continuous learning, and student empowerment.
3. **Circular Economy & Sustainability**: Represented by the curved double-arrow smile arc beneath the book. Books should never be discarded—they circulate perpetually from reader to reader.
4. **"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"** (Education must never stop): Affordable books for every student and lifelong learner.

### Aesthetic Blend
- **Stripe's Precision**: Clean layouts, micro-typography, crisp 1px borders.
- **Airbnb's Warmth**: Inviting imagery, friendly cards, tactile interactions.
- **Notion's Calm**: Quiet spacing, restrained accents, readable typography.
- **Vercel's Speed**: Instant feedback, fluid motion, dark mode excellence.
- **Apple's Polish**: Glassmorphism, smooth radiuses, clear elevation hierarchy.

---

## 2. Extracted Color System (Logo Source of Truth)

The colors are directly sampled from the official **BookFry** emblem and wordmark.

```
       Logo Emblem & Wordmark Sampling:
       ┌──────────────────────────────────────────────────────────┐
       │ Primary Navy:   #1A3B5C (Book text & Emblem Base)         │
       │ Secondary Flame: #F26522 (Fry text & Main Flame)          │
       │ Accent Sun:     #FF9900 (Flame Core & Gold Highlights)   │
       └──────────────────────────────────────────────────────────┘
```

### 2.1 Complete 50–950 Color Scales

#### Primary Palette (Deep Navy Blue — Trust & Knowledge)
- **Primary 50**: `#EFF6FC` / `hsl(210, 60%, 96%)` — Soft tinted fills, badge backgrounds
- **Primary 100**: `#DCEBF8` / `hsl(210, 58%, 90%)` — Hover fills, subtle highlights
- **Primary 200**: `#B8D7F2` / `hsl(210, 56%, 80%)` — Light borders, subtle icons
- **Primary 300**: `#85B7E5` / `hsl(210, 55%, 65%)` — Muted branding, secondary graphics
- **Primary 400**: `#4B8FD0` / `hsl(210, 55%, 48%)` — Focus rings, active tabs
- **Primary 500**: `#26629B` / `hsl(210, 56%, 35%)` — Interactive hover state
- **Primary 600** *(Logo Primary)*: `#1A3B5C` / `hsl(210, 56%, 23%)` — Primary brand color, headers, primary CTAs
- **Primary 700**: `#142F4A` / `hsl(210, 58%, 18%)` — Dark mode primary fill
- **Primary 800**: `#0F2338` / `hsl(210, 60%, 14%)` — Dark mode surface background
- **Primary 900**: `#0B1928` / `hsl(210, 62%, 10%)` — Dark mode root background
- **Primary 950**: `#060E17` / `hsl(210, 65%, 6%)` — Deepest dark backdrop

#### Secondary Palette (Fiery Orange — Energy & Fry Spark)
- **Secondary 50**: `#FFF5ED` / `hsl(20, 100%, 97%)` — Sale badge background, alert tint
- **Secondary 100**: `#FFE6D4` / `hsl(20, 95%, 92%)` — Light orange badge border
- **Secondary 200**: `#FFC9A3` / `hsl(20, 92%, 83%)` — Hover state for light orange buttons
- **Secondary 300**: `#FFA266` / `hsl(20, 90%, 71%)` — Secondary highlight line
- **Secondary 400**: `#FB7A33` / `hsl(20, 89%, 60%)` — Active discount tag, hover CTAs
- **Secondary 500** *(Logo Flame)*: `#F26522` / `hsl(20, 89%, 54%)` — Secondary action button, sale highlights, flame accent
- **Secondary 600**: `#D64E0F` / `hsl(20, 85%, 46%)` — Deep flame CTA hover
- **Secondary 700**: `#B23B09` / `hsl(20, 82%, 38%)` — Dark mode sale accent
- **Secondary 800**: `#8E2D06` / `hsl(20, 80%, 31%)` — Dark mode badge fill
- **Secondary 900**: `#6E2104` / `hsl(20, 78%, 24%)` — Deep burn accent
- **Secondary 950**: `#421202` / `hsl(20, 80%, 14%)` — Dark mode shadow glow

#### Accent Palette (Warm Sun Gold — Deals & Highlights)
- **Accent 50**: `#FFF9EB` / `hsl(36, 100%, 96%)`
- **Accent 100**: `#FFF0CC` / `hsl(36, 100%, 90%)`
- **Accent 500** *(Logo Sun Gold)*: `#FF9900` / `hsl(36, 100%, 50%)` — Star ratings, deal highlights
- **Accent 600**: `#E08700` / `hsl(36, 95%, 44%)`
- **Accent 900**: `#703C00` / `hsl(36, 85%, 22%)`

#### Semantic Status Palettes
- **Success**: `#1E8E5A` (50: `#E8F8F0`, 500: `#1E8E5A`, 900: `#0A3A23`) — Verified seller, order delivered
- **Warning**: `#D97706` (50: `#FFFBEB`, 500: `#D97706`, 900: `#78350F`) — Low stock, pending verification
- **Danger**: `#DC2626` (50: `#FEF2F2`, 500: `#DC2626`, 900: `#7F1D1D`) — Banned, out of stock, error
- **Info**: `#2563EB` (50: `#EFF6FF`, 500: `#2563EB`, 900: `#1E3A8A`) — Informational alert, tracking status

---

## 3. Typography & Hierarchy

### Font Families
- **Headings / Display**: `Source Serif 4` / `Fraunces` — Expresses editorial bookshop elegance.
- **UI & Body**: `Inter` — Precision, high legibility across screens.
- **Monospace**: `JetBrains Mono` — Order IDs, ISBN numbers, prices, SKUs.

### Typographic Scale
| Scale Token | Font Size | Line Height | Font Weight | Font Family | Usage |
|---|---|---|---|---|---|
| `display-2xl` | 3.75rem (60px) | 1.1 | 700 Bold | Serif | Hero primary headline |
| `display-xl` | 3.00rem (48px) | 1.15 | 700 Bold | Serif | Page hero title |
| `h1` | 2.25rem (36px) | 1.2 | 600 SemiBold | Serif | Main page titles |
| `h2` | 1.75rem (28px) | 1.25 | 600 SemiBold | Serif | Section headers |
| `h3` | 1.25rem (20px) | 1.3 | 600 SemiBold | Sans | Module & card titles |
| `h4` | 1.125rem (18px) | 1.4 | 600 SemiBold | Sans | Subgroup headers |
| `body-lg` | 1.125rem (18px) | 1.6 | 400 Regular | Sans | Lead paragraphs |
| `body` | 1.00rem (16px) | 1.5 | 400 Regular | Sans | Base body copy |
| `sm` | 0.875rem (14px) | 1.4 | 400/500 | Sans | Metadata, form labels |
| `xs` | 0.75rem (12px) | 1.3 | 500/600 | Sans | Badges, tags (tracked) |
| `mono` | 0.875rem (14px) | 1.4 | 500 Medium | Mono | ISBN, SKUs, Prices |

---

## 4. Spacing Scale, Grid System & Breakpoints

### Base Unit: 4px
Scale steps: `4px (0.25rem)`, `8px (0.5rem)`, `12px (0.75rem)`, `16px (1rem)`, `24px (1.5rem)`, `32px (2rem)`, `48px (3rem)`, `64px (4rem)`, `96px (6rem)`, `128px (8rem)`.

### Grid System
- **Desktop (xl / 1280px+)**: 12 columns, 24px gutter, 32px margin. Max content width: `1280px` (Marketing), `1440px` (Dashboards).
- **Tablet (md / 768px - 1023px)**: 8 columns, 20px gutter, 24px margin.
- **Mobile (sm / < 768px)**: 4 columns, 16px gutter, 16px margin.

### Breakpoints
- `sm`: 640px (Mobile landscape)
- `md`: 768px (Tablet)
- `lg`: 1024px (Laptop)
- `xl`: 1280px (Desktop)
- `2xl`: 1536px (Large Desktop)

---

## 5. Border Radius, Shadow & Elevation System

### Border Radius
- `--radius-sm`: `6px` (Inputs, small badges, chips)
- `--radius-md`: `10px` (Buttons, book cards, form containers)
- `--radius-lg`: `16px` (Modals, feature banners, hero cards)
- `--radius-full`: `9999px` (Avatars, pill filters, status dots)

### Shadow System
- **Shadow sm**: `0 1px 2px rgba(26, 59, 92, 0.05)` — Subtle cards, inputs
- **Shadow md**: `0 4px 12px rgba(26, 59, 92, 0.08)` — Card hover, dropdowns
- **Shadow lg**: `0 12px 32px rgba(26, 59, 92, 0.12)` — Sticky navbars, popovers
- **Shadow xl**: `0 20px 48px rgba(26, 59, 92, 0.16)` — Modals, drawer overlays

---

## 6. Motion & Transition Timing

- **Micro-interactions**: `120ms ease-out` — Button hover/active press (`scale(0.98)`).
- **Card Hover**: `200ms cubic-bezier(0.22, 1, 0.36, 1)` — `scale(1.015)` + shadow elevation.
- **Page Transitions**: `250ms cubic-bezier(0.22, 1, 0.36, 1)` — Fade + 8px slide-up.
- **Drawer Slide**: `300ms cubic-bezier(0.32, 0.72, 0, 1)`.
- **Reduced Motion**: All animations disabled when `prefers-reduced-motion: reduce` is active.

---

## 7. Component Specifications

### 7.1 Buttons
- **Primary (`.btn-primary`)**: Solid Navy Blue (`#1A3B5C`), text white. Hover: Primary 500 (`#26629B`). Focus: 2px ring in Navy.
- **Secondary (`.btn-secondary`)**: Solid Fiery Orange (`#F26522`), text white. Hover: Secondary 600 (`#D64E0F`). Used for high-energy actions (Buy Now, Today's Deals, Sell Books).
- **Outline (`.btn-outline`)**: 1px border (`--border`), background surface. Hover: `bg-background-subtle`.
- **Ghost (`.btn-ghost`)**: Transparent. Hover: `bg-background-subtle`.
- **State Requirement**: Always display a loading spinner (`<Loader2 className="animate-spin" />`) + `disabled` state when mutating.

### 7.2 Book Cards & Product Cards
- **Ratio**: 2:3 aspect ratio cover container (`aspect-[2/3]`).
- **Hover Effect**: `scale(1.015)` + `shadow-md` + 1px border tint.
- **Badges**: Condition badge (`New`, `Like New`, `Good`, `Fair`) top-left; Discount badge (`35% OFF`) in Secondary Fiery Orange top-right.
- **Title**: 1-line truncation (`line-clamp-1`), font-sans, font-semibold.
- **Author**: 1-line truncation (`line-clamp-1`), text-muted.
- **Rating**: Star rating (Flame Gold `#FF9900`), rendered ONLY if reviews exist.
- **Quick Action**: Quick Add-to-Cart circular button appears on hover (desktop) / visible (mobile).

### 7.3 Navbar & Header
- **Top Announcement Bar**: Fiery Orange fill (`#F26522`), text white, dismissible, promo message ("Free Shipping over $35 | Code: BOOKWORM").
- **Main Bar**: Sticky top-0, background `bg-background/90` with `backdrop-blur-md`.
- **Wordmark**: `BookFry` (Wordmark: "Book" in Navy, "Fry" in Fiery Orange + flame icon).
- **Search Autosuggest**: Full-width search bar with live catalog search results dropdown (showing thumbnail, title, author, price, condition).
- **Category Subnav**: Inline text links (Fiction, Non-Fiction, Exams, Manga, Deals) with animated underline hover.

### 7.4 Seller & Admin Dashboards
- **Shell Layout**: Fixed sidebar + top navbar header.
- **KPI Summary Cards**: White surface, 1px border, top brand accent bar, metric value (`text-2xl font-bold font-mono`), change indicator (% increase/decrease).
- **Data Tables**: Striped hover rows, server-side pagination bar, status badges, bulk action toolbar.

### 7.5 Required State System for ALL Views
Every view and module MUST implement the 4 core states:
1. **Loading State**: Exact skeleton representation matching component dimensions (e.g. `SkeletonBookCard`).
2. **Error State**: Illustrative error card with clear message and retry CTA.
3. **Empty State**: Friendly illustration + clear call to action ("No saved wishlist items yet — Browse Catalog").
4. **Success State**: Clear toast notification or inline checkmark confirmation.

---

## 8. Accessibility & Compliance

- Contrast ratio ≥ 4.5:1 for body text; ≥ 3:1 for large display titles and active icons.
- All interactive controls are keyboard navigable with visible 2px focus rings (`ring-2 ring-primary ring-offset-2`).
- Every non-text element has an `aria-label` or `alt` text.
