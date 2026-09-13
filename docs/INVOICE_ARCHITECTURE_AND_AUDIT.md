# BookFry — Buyer Invoice Architecture, Commercial Logic Audit & Production Specification

**Document Version**: 1.0 (Production Financial Architecture)  
**Authors**: Principal Software Architect, Principal Product Designer, Senior Full-Stack Engineer, Mobile UX Architect  
**Project**: BookFry (*"क्योंकि.. पढ़ाई रुकनी नहीं चाहिए"*)  
**Repository**: MohitJoshi787898/BookFry  
**Date**: September 2026  

---

## 1. BookFry Product Understanding

**BookFry** is a specialized textbook and academic book marketplace for Indian students, competitive examination aspirants (JEE, NEET, UPSC, GATE, CAT, etc.), teachers, and academic bookshops.

### The Problem BookFry Solves
In India, higher education textbooks and exam prep guides are costly expenses for students. Meanwhile, previous batches of students retain stacks of gently used books they no longer need. Existing horizontal classifieds suffer from lack of trust, zero catalog organization, fraud risks, and cumbersome price discovery.

### How the Marketplace Operates
BookFry organizes books into a **two-tier catalog architecture**:
1. **Canonical Book (`BookCatalogModel`)**: Unique per ISBN (10 or 13 digits). Holds title, author, publisher, edition, category, description, and canonical cover art.
2. **Seller Listing (`BookListingModel`)**: Many per ISBN. Represents an individual seller's physical copy, with independent price, discount, available stock, condition grade (`new`, `like_new`, `good`, `fair`), condition notes, seller photos, and geographical location.

### Buyer Experience & User Personas
- **Buyer**: Searches by title/exam/ISBN, compares offers from multiple verified bookstores and fellow student sellers, adds new or used books to cart, and completes checkout.
- **Seller**: Independent bookshops or students who list copies, receive partitioned sub-orders, package items, print shipping labels / AWBs, and receive payouts.
- **Admin**: Governs seller verification, moderates listings, manages platform commissions and taxes, reviews dispute returns.

---

## 2. Existing Order Architecture

### Master Order & Partitioned Sub-Orders
When a buyer checks out a cart with books from multiple sellers:
1. **Master Order (`OrderModel`)**:
   - `orderNumber`: Human-readable identifier (e.g. `ORD-984210-AB12`).
   - `buyerId`: Reference to buyer `User`.
   - `items`: Snapshot of purchased items (listingId, bookId, sellerId, title, price, quantity, condition).
   - `shippingAddress`: Pinned delivery address snapshot.
   - Financial totals: `subtotal`, `discountAmount`, `couponCode`, `shippingFee`, `tax`, `total`, `currency`.
   - Lifecycle state: `status` (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `refunded`, etc.) and `paymentStatus` (`pending`, `paid`, `failed`, `refunded`).
2. **Sub-Orders (`Order.subOrders`)**:
   - Partitioned by `sellerId` (`${orderNumber}-S1`, `${orderNumber}-S2`).
   - Enables independent packaging, AWB generation, courier tracking, and individual seller payouts (`sellerPayout`).

---

## 3. Existing Payment Architecture

- **Gateway**: Razorpay Standard Web Checkout (active via `NEXT_PUBLIC_RAZORPAY_KEY_ID`).
- **Payment Lifecycle**:
  1. `POST /api/v1/orders`: Creates order with `paymentStatus: 'pending'`, reserves stock.
  2. `POST /api/v1/payments/create-razorpay-order`: Generates Razorpay Order ID for exact `order.total`.
  3. Client Razorpay Checkout Modal opens.
  4. `POST /api/v1/payments/verify`: Verifies Razorpay HMAC-SHA256 signature inside MongoDB session.
  5. Order status transitions to `confirmed`, `paymentStatus` to `paid`.
  6. Seller transaction records (`TransactionModel`) generated for seller escrow.

---

## 4. Existing New vs. Old Book Logic

In BookFry, book condition is stored as an enum:
```ts
export type BookCondition = 'new' | 'like_new' | 'good' | 'fair';
```
- **New Book**: `condition === 'new'`. Represents unread, publisher-mint copies from registered bookshops/publishers.
- **Used / Old Book**: `condition in ['like_new', 'good', 'fair']`. Represents student-owned, pre-circulated books.

### Commercial Distinction:
- **New Books**: Retail marketplace transaction. Platform fee and GST apply.
- **Old / Pre-Owned Books**: Peer-to-peer student circulation. Under BookFry circular economy rules, **0% platform fee and 0% GST** apply.

---

## 5. Existing Platform Fee Logic

- Stored in `PlatformSettingsModel`: `commissionPercent: 10` (default 10%).
- Currently calculated during payment verification in `payments.controller.ts`:
  ```ts
  const platformFee = parseFloat((amount * 0.10).toFixed(2));
  const netPayout = parseFloat((amount - platformFee).toFixed(2));
  ```
- Stored on `TransactionModel` (seller escrow).
- **Audit Finding**: In the current `OrderModel`, there is no buyer-facing platform fee field. The platform fee exists as the marketplace commission deducted from retail sellers. Invoices must clearly differentiate between retail seller platform charges (or buyer fee where configured) and exempt used book circulation.

---

## 6. Existing GST / Tax Logic

- `PlatformSettingsModel` contains `taxPercent: 18`.
- In `orders.service.ts` line 217 & 420:
  ```ts
  const tax = parseFloat((discountedSubtotal * 0.08).toFixed(2));
  ```
- Currently, `orders.service.ts` was hardcoding `0.08` (8%) across the entire discounted subtotal regardless of whether items were new or used.
- In `tax-invoice-document.tsx` (the frontend mockup):
  - Hardcoded fake GSTIN: `07AAACB9876F1Z5`.
  - Hardcoded 50/50 split of the 8% tax: `CGST (4%)` and `SGST (4%)`.
  - Applied tax to all items uniformly, including used books.

---

## 7. Existing Invoice Capability

- Routes:
  - Frontend: `/orders/[id]/invoice` and `/invoice/[id]` (both rendering `tax-invoice-document.tsx`).
  - Backend: `GET /api/v1/orders/public/:id` calling `OrdersService.getPublicInvoice()`.
- Limitations of current invoice implementation:
  1. No server-side PDF generation — clicking "Download Bill PDF" merely executed `window.print()` in the browser!
  2. No distinction between New and Used books (fake GST shown for used books).
  3. No multi-seller breakdown: all sellers lumped into one table without seller store attribution.
  4. Hardcoded colors violating BookFry design token system (`#1A3B5C`, `#F26522`).
  5. Invented corporate GSTIN (`07AAACB9876F1Z5`) without legal backing.
  6. Incomplete mobile experience (A4 desktop document layout with horizontal table overflow).

---

## 8. Problems Discovered During Audit

| # | Discovered Issue | Severity | Impact | Resolution |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **No Server-Side PDF Generation** | High | Buyers could not download authentic PDF receipts; mobile print failed or rendered messy web chrome. | Implement pure server-side PDF generation using `pdfkit`, streaming real PDF files with exact layout parity. |
| 2 | **Uniform Tax on Used Books** | Critical | Used books were taxed at 8%, violating the BookFry circular economy business rule (No GST on used books). | Distinguish new vs. used items in tax calculation and invoice breakdown. |
| 3 | **Invented GSTIN & Legal Data** | Medium | Hardcoded `07AAACB9876F1Z5` gives false illusion of registered corporate tax status without real backend settings. | Format invoice as an authentic marketplace receipt; clearly label platform details from `PlatformSettingsModel` or environment, omitting fabricated GSTIN. |
| 4 | **No Per-Seller Line Attribution** | Medium | In multi-seller carts, buyers had no indication of which seller supplied which book. | Group or tag invoice items with their fulfilling seller store name. |
| 5 | **Dark Mode & Styling Hardcoding** | Medium | Raw hex `#1A3B5C` and `#F26522` used inline, dark mode broken on print and document view. | Refactor to semantic CSS variables and design tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`, etc.). |
| 6 | **Unauthenticated / Insecure Route Naming** | Medium | Route was named `/public/:id` but actually required JWT auth, causing confusion. | Provide clean, authorized `/api/v1/orders/:id/invoice` and `/api/v1/orders/:id/invoice/download` endpoints with IDOR protection. |

---

## 9. Final Production Invoice Architecture

```
                 Order (MongoDB / OrderModel)
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [GET /orders/:id/invoice]   [GET /orders/:id/invoice/download]
             │                                   │
             ▼                                   ▼
    InvoiceService.buildInvoiceData     InvoiceService.generatePdfBuffer
    (Aggregates snapshot data,          (Renders printable vector A4 PDF
     applies new vs used logic,          via pdfkit with brand colors,
     populates seller store names)       tables, notes & page numbering)
             │                                   │
             ▼                                   ▼
    JSON ApiResponse<InvoiceData>        Streams application/pdf
             │                                   │
             ▼                                   ▼
    Next.js Client Invoice Preview      Browser downloads actual PDF
    (Responsive, Dark Mode, Mascot      ("BookFry-Invoice-ORD-XXXX.pdf")
     states, native mobile dock)
```

---

## 10. Invoice Data Source & Immutability Guarantee

- **Primary Source of Truth**: The persisted `Order` document and its snapshot fields (`order.items`, `order.shippingAddress`, `order.subtotal`, `order.tax`, `order.shippingFee`, `order.total`).
- **Never Recalculate from Live Listings**: Even if a seller subsequently changes price, modifies condition notes, or deletes their listing, the invoice references strictly the immutable snapshot preserved in the order.
- **Seller Data**: Seller store name and city populated at time of invoice rendering (or fallback to snapshot).

---

## 11. Multi-Seller Handling

When an order contains items from multiple sellers (e.g. Seller 1 and Seller 2):
1. The invoice displays a **Unified Buyer Invoice** matching the single payment made by the buyer.
2. Items in the itemized table display a **"Fulfilled by [Seller Store Name]"** badge.
3. Sub-orders are listed with their respective status and delivery tracking details.
4. Payouts and seller commissions remain internal to the seller sub-orders and are not billed to the buyer.

---

## 12. New-Book Commercial & Financial Treatment

- Condition: `condition === 'new'`.
- Commercial Classification: `New / Retail Edition`.
- Financial Treatment:
  - Commercial marketplace retail sale.
  - Platform fee and GST apply as stored in the order financial breakdown.
  - Clearly displayed on item line: *"New Book • GST Applicable"*.

---

## 13. Old-Book Commercial & Financial Treatment

- Condition: `condition in ['like_new', 'good', 'fair']`.
- Commercial Classification: `Pre-Owned / Circular Economy`.
- Financial Treatment:
  - Student peer-to-peer circulation.
  - **No platform fee**.
  - **No GST** (exempt under BookFry educational circulation policy).
  - Clearly displayed on item line: *"Pre-Owned • 0% GST (Student Circulation)"*.

---

## 14. Security Model & IDOR Prevention

- **Authentication**: All invoice preview and download endpoints require a valid JWT access token.
- **Authorization Verification**:
  ```ts
  const isAdmin = roles.includes('admin');
  const isBuyer = order.buyerId.toString() === userId;
  const isSellerOfItem = order.items.some(item => item.sellerId.toString() === userId);

  if (!isAdmin && !isBuyer && !isSellerOfItem) {
    throw new UnauthorizedError('You are not authorized to view or download this invoice.');
  }
  ```
- **IDOR Protection**: Requests attempting to access invoices of orders owned by other buyers return `403 Forbidden` / `401 Unauthorized`.
- **Payment Pending State**: Unpaid orders are marked with an prominent "PAYMENT PENDING / PROFORMA" banner, preventing fraudulent proof of payment.

---

## 15. Server-Side PDF Generation Strategy

- **Engine**: Pure Node.js `pdfkit` (fast, lightweight, zero system dependencies, vector-sharp).
- **Layout**: Standard ISO A4 (595.28 x 841.89 points) with 36pt margins.
- **Design & Typography**:
  - Official BookFry brand colors: Deep Navy (`#1A3B5C`) for header band & headings; Fiery Orange (`#F26522`) for accents and totals.
  - Professional tabular layout for items, quantities, condition grades, unit rates, and totals.
  - Distinct summary section showing items subtotal, coupon savings, delivery charge, GST breakdown (on new books), and Grand Total.
  - Footer with computer-generated invoice declaration and timestamp.
- **Print Optimization**: Clean white background ensuring sharp, ink-efficient physical printing regardless of user's screen theme.

---

## 16. Mobile UX & Native Feel

- **Full-Width Responsive Architecture**: Adapts seamlessly to 320px–640px mobile viewports.
- **Card-Based Mobile Item View**: Instead of a wide table requiring horizontal scrolling, mobile renders structured item cards with clear condition tags, seller name, quantity, and price.
- **Sticky Bottom Action Dock**: Thumb-accessible floating bottom dock with prominent "Download PDF" and "Share Invoice" buttons.
- **Safe Area Insets**: Respects mobile notch and bottom navigation bars (`pb-28 sm:pb-12`).

---

## 17. Dark-Mode UX

- Preview interface strictly adheres to BookFry CSS tokens:
  - Page backdrop: `bg-background`
  - Document card: `bg-card text-card-foreground border-border`
  - Table headers: `bg-primary text-primary-foreground`
  - Badges: semantic status tokens (`bg-success/10 text-success`, `bg-secondary/10 text-secondary`)
- PDF Output: Always generated in crisp, professional print-ready light layout for physical printing.

---

## 18. Mascot Usage

In accordance with BookFry brand identity, the friendly BookFry fox mascot is used strategically:
- **Loading State**: Focused waiting mascot (`/assets/mascot/mascot-loading.webp`).
- **Download Success Toast**: Celebrating mascot (`/assets/mascot/mascot-success.webp`).
- **Error / Not Found State**: Helpful concerned mascot (`/assets/mascot/mascot-error.webp`).
- **Important Rule**: The mascot is never placed inside the legal financial PDF document itself, keeping the formal document authoritative.

---

## 19. Future Improvements

1. **Seller GSTIN Entry**: In the future, allow registered business sellers to provide their verified GSTIN for B2B input tax credit invoices.
2. **HSN / SAC Code Mapping**: Add standard HSN codes (4901 for printed books, 9983 for platform services) when full B2B tax compliance is needed.
3. **Cloud Storage Archival**: Upload generated invoice PDFs to S3/Cloudinary upon payment confirmation for instant static CDN streaming.

---

## 20. Unresolved Legal / Tax / Business Items

- **HSN Codes**: Currently not stored in `BookCatalogModel`. Standard 4901 can be documented as default for printed books.
- **GSTIN Registration**: BookFry is currently operating as a campus marketplace platform without a hardcoded real GSTIN. The system correctly labels invoices as marketplace order receipts and computer-generated invoices without inventing fake GSTIN numbers.
