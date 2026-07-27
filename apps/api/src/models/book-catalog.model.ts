import mongoose, { Schema, Document } from 'mongoose';

export interface IBookCatalogDocument extends Document {
  title: string;
  slug: string;
  author: string;
  isbn: string;
  description: string;
  category: mongoose.Types.ObjectId;
  images: Array<{ url: string; publicId: string }>;
  tags: string[];
  language: string;
  publisher?: string;
  edition?: string;
  pageCount?: number;
  ratingAvg: number;
  ratingCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookCatalogSchema = new Schema<IBookCatalogDocument>(
  {
    title: { type: String, required: true },
    // Slug: unique identifier for URL routing (title-based, unique per ISBN)
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    author: { type: String, required: true },
    // ISBN is the deduplication key — one catalog entry per ISBN
    isbn: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: {
      type: [{ url: String, publicId: String }],
      default: [],
    },
    tags: { type: [String], default: [] },
    language: { type: String, required: true, default: 'English' },
    publisher: { type: String },
    edition: { type: String },
    pageCount: { type: Number },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    viewsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Full-text search on catalog metadata
BookCatalogSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
BookCatalogSchema.index({ category: 1 });

export const BookCatalogModel = mongoose.model<IBookCatalogDocument>('BookCatalog', BookCatalogSchema);
export default BookCatalogModel;
