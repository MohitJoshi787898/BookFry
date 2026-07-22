import mongoose, { Schema, Document } from 'mongoose';

export interface IContactDocument extends Document {
  name: string;
  email: string;
  subject: 'General' | 'Order Issue' | 'Selling Question' | 'Report a Listing' | 'Partnership';
  message: string;
  status: 'open' | 'resolved';
  createdAt: Date;
}

const ContactSchema = new Schema<IContactDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: {
      type: String,
      required: true,
      enum: ['General', 'Order Issue', 'Selling Question', 'Report a Listing', 'Partnership'],
    },
    message: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['open', 'resolved'], default: 'open' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ContactModel = mongoose.model<IContactDocument>('Contact', ContactSchema);
export default ContactModel;
