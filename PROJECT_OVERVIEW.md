# BookFry — Full Project Overview, Architecture (HLD & LLD), Setup & Run Guide

> **Brand Slogan**: *"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"* (*Education must never stop*)  
> **Repository**: Monorepo using **pnpm Workspaces** + **Turborepo**

---

## 📖 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [High-Level Design (HLD)](#2-high-level-design-hld)
   - [System Architecture Diagram](#system-architecture-diagram)
   - [Component Breakdown](#component-breakdown)
   - [Authentication & Security Flow](#authentication--security-flow)
   - [Payment & Storage Integrations](#payment--storage-integrations)
3. [Low-Level Design (LLD)](#3-low-level-design-lld)
   - [Backend Layering Pattern](#backend-layering-pattern)
   - [Database Schemas & Models](#database-schemas--models)
   - [Frontend Architecture & State Management](#frontend-architecture--state-management)
   - [UI Design System & 8-State Coverage](#ui-design-system--8-state-coverage)
   - [API Endpoint Reference](#api-endpoint-reference)
4. [Complete Project Folder Structure](#4-complete-project-folder-structure)
5. [Prerequisites & Environment Setup](#5-prerequisites--environment-setup)
6. [Installation & Setup Step-by-Step](#6-installation--setup-step-by-step)
   - [Step 1: Prerequisites Verification](#step-1-prerequisites-verification)
   - [Step 2: Clone & Install Dependencies](#step-2-clone--install-dependencies)
   - [Step 3: Environment Variables Setup](#step-3-environment-variables-setup)
   - [Step 4: Database & Redis Initialization](#step-4-database--redis-initialization)
   - [Step 5: Database Seeding & Demo Accounts](#step-5-database-seeding--demo-accounts)
7. [Running the Application](#7-running-the-application)
   - [Full Monorepo (Concurrent)](#full-monorepo-concurrent)
   - [Frontend Only (`apps/web`)](#frontend-only-appsweb)
   - [Backend Only (`apps/api`)](#backend-only-appsapi)
8. [Testing & Quality Verification](#8-testing--quality-verification)
9. [Demo Login Credentials Matrix](#9-demo-login-credentials-matrix)

---

## 1. Executive Summary

**BookFry** is an enterprise-grade digital marketplace designed for buying, selling, and exchanging new and used books across India. It supports three distinct user roles:
- 🛒 **Customer**: Browse books, search, filter by condition/category/location, manage cart & wishlist, place orders, write reviews.
- 📚 **Seller**: List books (used or new), manage inventory, view orders, track revenue and sales metrics via the seller portal (`/seller/dashboard`).
- 👑 **Admin / Moderator**: Platform management, user role moderation, book listing approvals, order resolution, platform analytics via `/admin/dashboard`.

---

## 2. High-Level Design (HLD)

### System Architecture Diagram

```
                                    +------------------------------+
                                    |    User Browser / Client     |
                                    |  Next.js 15 (App Router)     |
                                    +--------------+---------------+
                                                   |
                                            HTTPS / REST API
                                                   |
                                                   v
                                    +------------------------------+
                                    |     Express API Gateway      |
                                    | (Helmet, CORS, Rate Limit)   |
                                    +--------------+---------------+
                                                   |
      +--------------------+-----------------------+-----------------------+--------------------+
      |                    |                       |                       |                    |
      v                    v                       v                       v                    v
+-----------+    +------------------+    +-------------------+    +-----------------+   +------------------+
| MongoDB   |    | Redis Cache      |    | Stripe / Razorpay |    | Cloudinary      |   | Socket.io        |
| Atlas     |    | (Session/Queue)  |    | (Payments)        |    | (Book Covers)   |   | (Realtime Ops)   |
+-----------+    +------------------+    +-------------------+    +-----------------+   +------------------+
```

### Component Breakdown

1. **Frontend App (`apps/web`)**:
   - Framework: **Next.js 15** with React 19 (Server Components + Client Components).
   - Styling: **TailwindCSS** + **shadcn/ui** + custom HSL CSS variables (`global.css`).
   - Motion: **Framer Motion** for micro-interactions and smooth page transitions.
   - Client State: **Zustand** (`useAuthStore`, `useCartStore`, `useAuthModalStore`).
   - Server State & Cache: **TanStack Query** (`useQuery`, `useMutation`).

2. **Backend API (`apps/api`)**:
   - Runtime: **Node.js 20+** with **Express.js** and TypeScript.
   - Security: **Helmet** HTTP headers, **CORS** origin validation, **express-rate-limit** window protection.
   - Validation: **Zod** schema validation on all incoming request bodies, queries, and params.
   - Logging: **Winston** structured logging.

3. **Data Layer**:
   - Primary DB: **MongoDB** (via Mongoose ODM) storing Users, Books, Categories, Orders, Reviews, Wishlists, Notifications.
   - In-Memory DB / Cache: **Redis 7** for session management, fast caching, rate limiting, and async background queue jobs (BullMQ).

4. **Shared Types Package (`packages/types`)**:
   - Centralized TypeScript interfaces and Data Transfer Objects (DTOs) shared seamlessly between `@bookmarket/web` and `@bookmarket/api`.

---

## 3. Low-Level Design (LLD)

### Backend Layering Pattern

The backend enforces a strict 5-tier architecture:
`Route Boundary → Controller Layer → Service Layer → Repository Layer → Mongoose Model`

```
  HTTP Request
      │
      ▼
┌──────────────┐   zod Validation
│  Routes      ├───────────────────► [Middleware] (Auth, RBAC, Rate Limit)
└──────┬───────┘
       │
       ▼
┌──────────────┐   Translates HTTP params <-> JS Objects
│ Controllers  │   (NO Mongoose queries allowed here)
└──────┬───────┘
       │
       ▼
┌──────────────┐   Pure Business Logic & Domain Rules
│  Services    │   (Transactions, Payment Provider calls, Math)
└──────┬───────┘
       │
       ▼
┌──────────────┐   Abstract Data Operations
│ Repositories │   (Database Queries & Mutations)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ DB Models    │   Mongoose Schemas & Mongo Driver
└──────────────┘
```

### Database Schemas & Models

Key entities in the system:
1. **User**: `name`, `email`, `password` (bcrypt hash), `role` (`customer` | `seller` | `admin`), `avatar`, `addresses`, `isVerified`, `createdAt`.
2. **Book**: `title`, `author`, `isbn`, `description`, `price`, `originalPrice`, `condition` (`new` | `like-new` | `good` | `fair`), `category` (ObjectId ref), `seller` (ObjectId ref), `images` (Cloudinary URLs), `stock`, `status` (`active` | `sold` | `archived`).
3. **Category**: `name`, `slug`, `description`, `icon`, `parentCategory`.
4. **Order**: `customer` (ObjectId ref), `items` (`book`, `quantity`, `price`), `totalAmount`, `shippingAddress`, `paymentStatus` (`pending` | `completed` | `failed`), `orderStatus` (`processing` | `shipped` | `delivered` | `cancelled`), `paymentProviderId`.
5. **Review**: `book` (ObjectId ref), `user` (ObjectId ref), `rating` (1 to 5), `comment`, `createdAt`.
6. **Wishlist**: `user` (ObjectId ref), `books` (array of Book ObjectIds).

### Frontend Architecture & State Management

- **Routing Groups**:
  - `(marketing)`: Landing page, hero, featured categories, why BookFry, testimonials.
  - `(shop)`: Catalog browsing `/books`, search filters, single book details `/books/[id]`.
  - `(auth)`: Login, signup, password reset pages and modals.
  - `(seller)`: Dashboard `/seller/dashboard`, list new book `/sell`.
  - `(admin)`: Management portal `/admin/dashboard` for managing users, listings, platform stats.
  - `cart`: Shopping cart and checkout flow.

- **8-State Coverage Guarantee**:
  Every interactive visual module handles:
  1. *Loading*: Animated Skeleton loaders matching component dimensions.
  2. *Success*: Full rendered view.
  3. *Empty*: Friendly illustration + message + primary Call-To-Action button.
  4. *Error*: Error banner + "Try Again" retry action.
  5. *Offline*: Offline detection notice.
  6. *No Results*: Filter relaxation recommendation.
  7. *Permission Denied*: Triggers authentication modal (`useAuthModalStore`).
  8. *Network Timeout*: Retry prompt.

### API Endpoint Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new customer or seller |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue JWT cookies |
| `POST` | `/api/v1/auth/logout` | Authenticated | Invalidate refresh token & clear cookies |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/v1/books` | Public | Query books (pagination, filtering, sorting) |
| `GET` | `/api/v1/books/:id` | Public | Get single book details |
| `POST` | `/api/v1/books` | Seller / Admin | Create a new book listing |
| `PUT` | `/api/v1/books/:id` | Seller / Admin | Update book listing |
| `DELETE` | `/api/v1/books/:id` | Seller / Admin | Soft delete/archive book listing |
| `GET` | `/api/v1/categories` | Public | Fetch all categories |
| `POST` | `/api/v1/orders` | Customer | Place new order |
| `GET` | `/api/v1/orders/my-orders` | Customer | View customer order history |
| `GET` | `/api/v1/admin/stats` | Admin | Fetch platform system statistics |

---

## 4. Complete Project Folder Structure

```
project/
├── .github/                       # CI/CD Workflows
│   └── workflows/
├── apps/
│   ├── api/                       # Express Backend
│   │   ├── src/
│   │   │   ├── config/            # Env, Database, Redis, Cloudinary configuration
│   │   │   ├── middlewares/       # Auth, RBAC, Error Handler, Rate Limiter
│   │   │   ├── models/            # Mongoose Schemas & Models
│   │   │   ├── modules/           # Feature Modules (admin, auth, books, cart, etc.)
│   │   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   ├── books/
│   │   │   │   ├── cart/
│   │   │   │   ├── categories/
│   │   │   │   ├── notifications/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── reviews/
│   │   │   │   ├── seller/
│   │   │   │   ├── users/
│   │   │   │   └── wishlist/
│   │   │   ├── routes/            # Main Express Router Router mounting
│   │   │   ├── scripts/           # DB Seeding & Admin Creation Scripts
│   │   │   ├── types/             # Backend-specific TypeScript types
│   │   │   ├── utils/             # Logger, AppError, AsyncHandler utilities
│   │   │   ├── app.ts             # Express App setup & middleware attachment
│   │   │   └── server.ts          # HTTP Server entry point & graceful shutdown
│   │   ├── .env                   # Local Environment Variables
│   │   ├── .env.example           # Template for Environment Variables
│   │   ├── package.json           # Backend package configuration
│   │   └── tsconfig.json          # TypeScript config
│   │
│   └── web/                       # Next.js 15 Frontend
│       ├── public/                # Static assets (images, icons, favicons)
│       ├── src/
│       │   ├── app/               # Next.js App Router Pages & Layouts
│       │   │   ├── (admin)/       # Admin Portal routes
│       │   │   ├── (auth)/        # Auth pages & callbacks
│       │   │   ├── (customer)/    # User profile & customer views
│       │   │   ├── (marketing)/   # Landing pages & promotional views
│       │   │   ├── (seller)/      # Seller portal & analytics
│       │   │   ├── (shop)/        # Book catalog & details
│       │   │   ├── cart/          # Shopping Cart & Checkout
│       │   │   ├── sell/          # Quick List Book form
│       │   │   ├── globals.css    # HSL CSS variables & Tailwind tokens
│       │   │   ├── layout.tsx     # Root layout & providers
│       │   │   ├── sitemap.ts     # SEO Sitemap generator
│       │   │   └── robots.ts      # SEO Robots rules
│       │   ├── components/        # Reusable UI Components
│       │   │   ├── admin/         # Admin components
│       │   │   ├── auth/          # Login/Signup/Auth Modals
│       │   │   ├── illustrations/ # Custom vector SVG assets
│       │   │   ├── marketing/     # Hero, Testimonials, Categories
│       │   │   ├── sell/          # Multi-step book listing forms
│       │   │   ├── seo/           # JSON-LD Schema injectors
│       │   │   └── shared/        # Navbar, Footer, Cards, Skeletons
│       │   ├── lib/               # API Clients & Axios/Fetch wrappers
│       │   ├── stores/            # Zustand State Stores (Auth, Cart, Modal)
│       │   ├── styles/            # Extra CSS styling modules
│       │   └── middleware.ts      # Next.js Route Protection & Auth Guard
│       ├── package.json           # Frontend package configuration
│       └── tailwind.config.ts     # Tailwind Design System Configuration
│
├── packages/
│   └── types/                     # Shared Monorepo TypeScript DTOs
│       ├── src/
│       │   └── index.ts           # Exported interfaces (User, Book, Order, etc.)
│       └── package.json
│
├── docs/                          # Official Documentation & Standards
│   ├── AGENTS.md                  # Development & AI Rules
│   ├── DESIGN.md                  # Design Tokens & Palette Specifications
│   └── IMPLEMENTATION_PLAN.md     # Engineering Roadmap & Specs
│
├── AGENTS.md                      # Monorepo Master Rules & Standards
├── docker-compose.yml             # Docker services (MongoDB 7.0 + Redis 7.2)
├── logindemodata.md               # Seed credentials reference
├── logindemodata.json             # Seed data payload
├── package.json                   # Root monorepo workspace configuration
├── pnpm-workspace.yaml            # PNPM Workspace packages definition
├── pnpm-lock.yaml                 # Monorepo lockfile
└── turbo.json                     # Turborepo task pipeline configuration
```

---

## 5. Prerequisites & Environment Setup

Before running the application, ensure the following software is installed on your computer:

| Dependency | Minimum Required Version | Recommended |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` | Node 20 LTS or Node 22 |
| **pnpm** | `>= 9.0.0` | `pnpm@10.2.2` |
| **Docker & Docker Desktop** | Latest (Optional for local DB) | Docker Desktop 4.x |
| **MongoDB** | MongoDB 7.0 (Docker or Mongo Atlas) | Mongo Atlas Cloud |
| **Redis** | Redis 7.2 (Docker or Upstash) | Docker local Redis |

---

## 6. Installation & Setup Step-by-Step

### Step 1: Prerequisites Verification
Open your command terminal and verify your installation versions:
```bash
node -v    # Must be >= v20.0.0
pnpm -v    # Must be >= 9.0.0
docker -v  # Optional, if using Docker for local DB
```

### Step 2: Clone & Install Dependencies
Clone the repository and install all monorepo workspace dependencies in one command:
```bash
# Clone the repository (if not already cloned)
git clone <your-repository-url>
cd project

# Install dependencies across all packages and apps
pnpm install
```

### Step 3: Environment Variables Setup
Create the environment configuration file inside `apps/api/.env`:

```bash
# In Windows PowerShell:
Copy-Item apps/api/.env.example apps/api/.env
```

Or manually create/verify `apps/api/.env` with these key-value entries:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bookmarket
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=bookfry_super_secret_access_jwt_token_2026!
JWT_REFRESH_SECRET=bookfry_super_secret_refresh_jwt_token_2026!
FRONTEND_URL=http://localhost:3000
```

*(Optional: Add `STRIPE_SECRET_KEY` and `CLOUDINARY_URL` if testing live payments or live image cloud uploads).*

### Step 4: Database & Redis Initialization
Start local MongoDB and Redis using Docker Compose:
```bash
docker compose up -d
```
*Alternatively*, if using **MongoDB Atlas cloud**, update `MONGODB_URI` in `apps/api/.env` with your Mongo Atlas connection string.

### Step 5: Database Seeding & Demo Accounts
Populate the database with sample categories, demo books, admin credentials, and test sellers:
```bash
pnpm --filter api seed
```
*(Or execute `npx ts-node src/scripts/seed.ts` inside `apps/api`).*

---

## 7. Running the Application

### Full Monorepo (Concurrent)
To start both the Next.js Frontend and Express Backend concurrently with live auto-reload (using Turborepo):

```bash
pnpm dev
```

- 🌐 **Frontend**: Open [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend API**: Running at [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

### Frontend Only (`apps/web`)
If you want to run only the Next.js marketplace application:
```bash
pnpm --filter web dev
```

### Backend Only (`apps/api`)
If you want to run only the Express backend API server:
```bash
pnpm --filter api dev
```

---

## 8. Testing & Quality Verification

Before committing changes, execute the monorepo quality suite:

```bash
# 1. Typecheck TypeScript across all apps & packages
pnpm typecheck

# 2. Run ESLint across monorepo
pnpm lint

# 3. Run Unit and Integration Tests
pnpm test

# 4. Perform a full production build
pnpm build
```

---

## 9. Demo Login Credentials Matrix

Use these pre-configured credentials (populated by the seed script) to test all features:

| Role | Portal / Access | Email | Password |
| :--- | :--- | :--- | :--- |
| 👑 **System Admin** | Admin Portal (`/admin/dashboard`) | `admin@bookfry.com` | `AdminBookFry123!` |
| 🛡️ **Senior Moderator** | Admin Portal (`/admin/dashboard`) | `moderator@bookfry.com` | `ModBookFry123!` |
| 📚 **Demo Seller** | Seller Portal (`/seller/dashboard`, `/sell`) | `demouser@bookfry.com` | `DemoUser123!` |
| 🏪 **John Seller** | Seller Portal (`/seller/dashboard`) | `seller@example.com` | `password123` |
| 🛒 **Alice Reader** | Customer Storefront | `customer@example.com` | `password123` |

---
*Documentation prepared for BookFry Production Architecture.*
