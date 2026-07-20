import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  amount: number;
  platformFee: number;
  netPayout: number;
  status: 'pending' | 'released' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    netPayout: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'released', 'withdrawn'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = mongoose.model<ITransactionDocument>(
  'Transaction',
  TransactionSchema
);
export default TransactionModel;
