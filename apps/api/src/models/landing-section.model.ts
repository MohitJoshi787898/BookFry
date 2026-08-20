import mongoose, { Schema, Document } from 'mongoose';

export type SectionType =
  | 'hero'
  | 'features'
  | 'quick_filter'
  | 'book_carousel'
  | 'knowledge_story'
  | 'category_grid'
  | 'why_us'
  | 'testimonials'
  | 'cta'
  | 'newsletter'
  | 'faq'
  | 'banner';

export interface ILandingSectionDocument extends Document {
  sectionId: string; // e.g. 'hero_main', 'trending_reads', 'used_books', 'faq_home'
  type: SectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  status: 'draft' | 'published';
  content: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LandingSectionSchema = new Schema<ILandingSectionDocument>(
  {
    sectionId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'hero',
        'features',
        'quick_filter',
        'book_carousel',
        'knowledge_story',
        'category_grid',
        'why_us',
        'testimonials',
        'cta',
        'newsletter',
        'faq',
        'banner',
      ],
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    enabled: { type: Boolean, default: true, index: true },
    order: { type: Number, required: true, default: 0, index: true },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published'],
      default: 'published',
    },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const LandingSectionModel = mongoose.model<ILandingSectionDocument>(
  'LandingSection',
  LandingSectionSchema
);

export default LandingSectionModel;
