import mongoose, { Schema, Document } from 'mongoose';

export interface IFaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface ICmsDocument extends Document {
  announcementText: string;
  announcementEnabled: boolean;
  announcementLink?: string;
  faqs: IFaqItem[];
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaqItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
});

const CmsSchema = new Schema<ICmsDocument>(
  {
    announcementText: {
      type: String,
      default: '🎉 Free Shipping on Student Book Exchanges above ₹499 across India! Use Code: WELCOME100',
    },
    announcementEnabled: { type: Boolean, default: true },
    announcementLink: { type: String, default: '/books' },
    faqs: {
      type: [FaqSchema],
      default: [
        {
          question: 'How does BookFry ensure authentic books?',
          answer: 'Every listing undergoes strict ISBN & seller rating verification before going live.',
          category: 'Quality',
        },
        {
          question: 'How long does campus book delivery take in India?',
          answer: 'Orders are dispatched within 24 hours and delivered across Indian cities in 2-4 business days.',
          category: 'Delivery',
        },
      ],
    },
  },
  { timestamps: true }
);

export const CmsModel = mongoose.model<ICmsDocument>('Cms', CmsSchema);
export default CmsModel;
