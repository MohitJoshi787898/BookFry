# BookFry Cloudinary Media & Asset Lifecycle Audit

## 1. Executive Summary & Defect Remediation
Prior to this forensic remediation, BookFry suffered from several critical media pipeline vulnerabilities:
1. **Unused Deletion Utility & Orphaned Assets**:
   - `deleteFromCloudinary` was declared in `apps/api/src/config/cloudinary.ts` but never called anywhere in the codebase.
   - User avatar replacements dumped new files to Cloudinary while previous images remained on Cloudinary servers indefinitely.
   - Deleting or updating book listings left old condition photos orphaned in Cloudinary.
2. **Missing Public ID Storage in User Schema**:
   - `User` model only saved `avatarUrl: string` and discarded the Cloudinary `public_id`, making targeted deletion impossible.
3. **MIME-Type Spoofing Vulnerability**:
   - Multer fileFilter only inspected `file.mimetype` headers, which can easily be spoofed by malicious clients.

---

## 2. Remediated Architecture

### A. Dual-Layer File Validation (`upload.middleware.ts`)
- **Layer 1: MIME-Type Whitelist**: Rejects non-image file uploads immediately at the stream boundary.
- **Layer 2: Magic Bytes Signature Verification (`validateImageMagicBytes`)**:
  - `JPEG`: `0xFF 0xD8 0xFF`
  - `PNG`: `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`
  - `WebP`: `RIFF` (bytes 0–3) and `WEBP` (bytes 8–11)
  - Enforced via `verifyImageFiles` middleware on all avatar and book upload routes.

### B. User Avatar Lifecycle & Cloudinary Garbage Collection
- Added `avatarPublicId` to `User` interface (`@bookmarket/types`) and `UserModel` (`apps/api/src/models/user.model.ts`).
- When `POST /users/avatar` is invoked:
  - If `currentUser.avatarPublicId` exists, `deleteFromCloudinary(currentUser.avatarPublicId)` is called before saving the new asset.
  - The new Cloudinary `publicId` is stored in the user profile alongside `avatarUrl`.

### C. Book Listing Image Garbage Collection
- In `BooksService.updateBook`:
  - When new images are supplied, any previous Cloudinary assets whose `publicId` is absent from the new payload are deleted via `deleteFromCloudinary`.
- In `BooksService.deleteBook`:
  - Iterates over all `listing.images` and cleans up each Cloudinary resource to prevent asset orphan accumulation.

### D. Frontend Image Experience & Responsive Sizing
- Next.js `<Image />` component utilized with exact `sizes`, `object-contain`/`object-cover`, and dark-mode safe styling.
- Interactive thumbnail gallery for condition photo inspection.
