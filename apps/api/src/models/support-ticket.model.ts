import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicketDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicketDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
    adminNote: { type: String },
  },
  { timestamps: true }
);

export const SupportTicketModel = mongoose.model<ISupportTicketDocument>(
  'SupportTicket',
  SupportTicketSchema
);
export default SupportTicketModel;
