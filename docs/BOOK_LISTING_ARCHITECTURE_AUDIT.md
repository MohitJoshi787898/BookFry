# BOOK_LISTING_ARCHITECTURE_AUDIT.md — BookFry Marketplace Architecture Audit & Specification

**Author**: Principal Software Engineer, Database Architect & Senior Frontend Architect  
**Date**: September 2026  
**System**: BookFry Production Web & API Marketplace  

---

## 1. Current Architecture & Core Entities

BookFry is built with a decoupled catalog and listing model:
- **Canonical Catalog (`BookCatalog`)**: Represents a single book entity across all publishers and editions, keyed by unique ISBN. Contains bibliographic metadata (Title, Author, Publisher, Edition, Language, Category, Page Count, Canonical Cover Images, Ratings).
- **Seller Listings (`BookListing`)**: Represents an individual seller's physical inventory offer for that canonical book. Contains commercial and condition-specific data (SellerId, CatalogId, Condition, Price, Discount Price, Stock Quantity, Pickup Location/Pincode, Photos, Physical Condition Notes, Status, Moderation History).

### Core Data Relationship
```
[BookCatalog] (1) ───◄ has many ───► (N) [BookListing] (Each listing = unique seller + condition + price)
```

---

## 2. Condition Logic & Audit Findings

BookFry operates on 4 standardized condition tiers:
1. **`new` (Brand New / Unused)**: Factory fresh, unopened/unread, suitable for BookFry Express delivery.
2. **`like_new` (Like New / Pristine)**: Read once or opened, clean spine, zero markings or creases.
3. **`good` (Standard Pre-Owned)**: Tight binding, minor shelf wear, clean readable text.
4. **`fair` (Heavily Read / Student Syllabus Copy)**: Worn cover, highlights/notes present, 100% complete pages.

### Critical Issues Discovered & Corrected
1. **Frontend Condition Disconnect**: The sell page (`sell/page.tsx`) previously displayed `['excellent', 'good', 'fair', 'poor']` and completely lacked the `new` (Brand New) condition tier. Selecting `poor` crashed on submission with 400 Bad Request because `poor` is not a valid enum in `books.validation.ts`.
2. **Seller Photo Storage**: `BookListingModel` did not store seller condition photos or condition notes. Photos were incorrectly routed only to the canonical catalog or dropped.
3. **Customer Selling Lockout**: `router.post('/')` in `books.routes.ts` enforced `requireRoles(['seller', 'admin'])`, rejecting new customer users (`roles: ['customer']`) who wanted to list their books.
4. **Hidden Storefront Offers**: `books/[slug]/page.tsx` rendered `<SellerOffersList catalogBook={book} />` without passing the `offers` array (`offers={(book as any).listings}`), permanently hiding competing seller offers from buyers.

---

## 3. Multiple Sellers Selling the Same Book

- When multiple sellers (e.g. Seller A with NEW @ ₹500, Seller B with LIKE NEW @ ₹350, and Seller C with GOOD @ ₹250) list the same ISBN, BookFry creates one canonical `BookCatalog` document.
- Each seller receives an isolated `BookListing` document referencing that `catalogId`.
- The canonical book page displays the cheapest active offer in the primary Buy Box and enumerates all competing seller offers in the "Other Offers from Verified Sellers" module.
- In cart and checkout, the exact `listingId` and condition are preserved and snapshotted into `Order.items` to guarantee historical immutability.

---

## 4. Tab-Based Listing Progress Workflow

The previous 1,042-line `sell/page.tsx` is restructured into a 6-step accessible tab workflow:
1. **Basic Info**: ISBN auto-fetch (with internal catalog and OpenLibrary fallback) + manual entry toggle.
2. **Condition**: 4 clear condition cards (`new`, `like_new`, `good`, `fair`) with physical condition notes.
3. **Pricing & Payout**: Price, shipping options, dynamic 10% platform fee earnings breakdown, UPI/Bank details.
4. **Inventory & Location**: Available stock, seller contact, 6-digit pincode auto-fill, pickup address.
5. **Photos**: Drag-and-drop image uploader (up to 4 images) with cover photo indicator.
6. **Review & Post**: Complete summary review, ownership declaration, seller policy agreement, one-click publish.

---

## 5. Full-Width Layout & Mobile-Native Architecture

- Eliminates arbitrary `max-w-[1600px]` wrappers in favor of `w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16` per `DESIGN.md`.
- Desktop view features a 2-column layout: Form workspace (7 columns) + Live Marketplace Listing Preview Card (5 columns).
- Mobile view features horizontal swipeable tabs, sticky bottom action dock with thumb-reachable buttons, and touch targets >= 44px.

---

## 6. Typography & Anti-AI Design Polish

- Replaced tiny `text-[10px]` and `text-xs` labels with an ergonomic typography hierarchy: headings in `font-serif text-2xl/text-3xl`, section headers in `text-lg font-bold`, field labels in `text-sm font-semibold`, inputs in `text-sm py-3 px-3.5`.
- Removed AI-generated visual patterns: arbitrary `rounded-3xl` everywhere, decorative colored icon circles, gradient blur blobs, and repetitive checkmark cards.
- Integrated a real-time marketplace preview card so sellers see exactly what buyers will see.
