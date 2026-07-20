import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  parentId: mongoose.Types.ObjectId | null;
  imageUrl?: string;
  order: number;
}

const CategorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  imageUrl: { type: String },
  order: { type: Number, default: 0 },
});

export const CategoryModel = mongoose.model<ICategoryDocument>('Category', CategorySchema);
export default CategoryModel;
