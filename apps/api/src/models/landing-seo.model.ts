import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingSeoDocument extends Document {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  updatedAt: Date;
}

const LandingSeoSchema = new Schema<ILandingSeoDocument>(
  {
    title: {
      type: String,
      default: 'BookFry • India\'s Book Marketplace | Buy & Sell Books',
    },
    description: {
      type: String,
      default:
        'Buy, sell, and discover verified new & used textbooks, entrance exam guides, and novels across India. Save up to 80% with secure student escrow.',
    },
    keywords: {
      type: [String],
      default: [
        'BookFry',
        'buy used books India',
        'sell old textbooks',
        'NEET JEE books',
        'college textbooks discount',
        'book marketplace India',
      ],
    },
    ogTitle: { type: String, default: 'BookFry • Buy & Sell Books Online' },
    ogDescription: {
      type: String,
      default:
        'India\'s premier digital book marketplace. Connect with student readers nationwide.',
    },
    ogImage: { type: String, default: '/og-image.png' },
    canonicalUrl: { type: String, default: 'https://bookfry.in' },
  },
  { timestamps: true }
);

export const LandingSeoModel = mongoose.model<ILandingSeoDocument>(
  'LandingSeo',
  LandingSeoSchema
);

export default LandingSeoModel;
