# BookFry Buyer & Seller Experience Audit

## 1. Executive Summary
The marketplace experience connects campus student buyers and sellers across India. Prior to this phase:
- Buyer profile had hardcoded mock address text (`Hostel 4, Room 212...`) and lacked connection to existing `/users/addresses` endpoints.
- No avatar photo upload or inline account update UI existed for students.
- Seller listings cards lacked book cover thumbnails, condition notes previews, and actionable rejection remediation.
- Seller quick edit modal omitted condition grade selection and condition notes.

---

## 2. Remediated Buyer Experience (`/account/profile`)
1. **Interactive Avatar Upload**:
   - Custom file input accepting JPEG/PNG/WebP under 5MB.
   - Hover state overlay with camera icon and uploading spinner.
   - Directly calls `POST /users/avatar`, synchronizes `auth.store` (`setUser`), and updates UI state.
2. **Account Details & Identity Management**:
   - Inline edit dialog allowing updates to Name and Phone number via `PATCH /users/profile`.
   - Displays student email, bcrypt password security status, and verified student badges.
3. **Saved Campus Delivery Destinations**:
   - Live synchronization with `GET/POST/PATCH/DELETE /users/addresses`.
   - **GPS Reverse-Geocoding**: 1-click location detection querying `GET /users/reverse-geocode` to auto-populate city, state, and pincode.
   - **Primary Address**: Visual default badge with 1-click "Set as Default" trigger (`PATCH /users/addresses/:id/default`).
   - **Contextual Delete Confirmation**: `AdminDangerModal` explicitly identifying the specific delivery destination before removal.

---

## 3. Remediated Seller Experience (`/seller/listings` & `/sell`)
1. **Enhanced Listing Cards**:
   - Cover/condition photo thumbnails (`next/image`) with fallback placeholder.
   - Quality grade badge (`Brand New`, `Like New`, `Good`, `Fair`).
   - Condition notes snippet preview.
   - **Rejection Warning Callout**: For rejected listings, displays moderator feedback and 1-click "Fix in Studio" link.
2. **Quick Edit Modal**:
   - Condition Grade Selector with standard BookFry quality definitions.
   - Condition Notes & Defects textarea.
   - Price and Available Stock adjustments.
   - Direct link to "Full Studio Editor" (`/sell?slug=...`) for complex multi-image uploads and location edits.
