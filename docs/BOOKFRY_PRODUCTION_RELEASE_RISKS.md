# BookFry Production Release Risks & Launch Readiness

**Document Version**: 1.0.0  
**Audit Date**: September 19, 2026  
**Auditor**: Principal Reliability & Security Architect  
**Target Environment**: AWS / Vercel + MongoDB Atlas + Redis Cloud + Razorpay Live

---

## 1. Risk Heatmap & Categorization

| Risk ID | Category | Description | Severity | Mitigation Implemented | Residual Risk |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **RSK-01** | Payments | Razorpay webhook delay or network drop | Medium | Webhook handler + Frontend synchronous callback fallback | Low |
| **RSK-02** | Inventory | Concurrent checkout of single-copy used book | Critical | Atomic MongoDB decrement (`stock: { $gte: qty }`) | Negligible |
| **RSK-03** | Auth | Unauthenticated location lookup failure | Low | **Remediated**: Route moved above `requireAuth` | None |
| **RSK-04** | CMS | Homepage failure on CMS service outage | High | **Remediated**: Added `DEFAULT_SECTIONS` fallback | None |
| **RSK-05** | Push | Missing Firebase service account credentials | Medium | Graceful error logging; app functions without crashing | Low |
| **RSK-06** | Rate Limit | Rapid ISBN lookup scraping OpenLibrary | Medium | In-memory cache + rate limiter middleware | Low |
| **RSK-07** | SEO | Dynamic routes missing social previews | High | **Remediated**: Async `generateMetadata` on `/books/[slug]` | None |

---

## 2. External Service Dependency Checklist

1. **Razorpay Live Gateway**:
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` must be configured in production environment.
   - Webhook endpoint (`https://api.bookfry.com/api/v1/payments/webhook`) must be registered in Razorpay Dashboard with matching `RAZORPAY_WEBHOOK_SECRET`.
2. **MongoDB Atlas**:
   - Minimum M10 cluster recommended for replica set transaction support.
   - Compound indexes verified for book search (`title`, `author`, `isbn`, `category`, `status`).
3. **Firebase Cloud Messaging (FCM)**:
   - `firebase-service-account.json` must be provisioned for push notifications to active mobile devices.
4. **Cloudinary / AWS S3**:
   - Secure upload signatures for seller book condition photographs.

---

## 3. Pre-Launch Deployment Gate

- [x] All 129 automated API tests passing
- [x] Next.js 15 production build succeeds with 49 static/dynamic routes
- [x] Zero TypeScript compilation errors across monorepo
- [x] Reverse geocode endpoint accessible without login
- [x] Multi-role navigation handles Buyer + Seller + Admin seamlessly
- [x] Homepage prerenders with robust fallback content
- [x] Financial calculation verified (8% New vs 0% Used GST)
- [x] Invoices generate with valid HSN/SAC codes
