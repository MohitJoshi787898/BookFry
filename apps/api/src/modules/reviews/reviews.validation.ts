import { z } from 'zod';

export const createReviewSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters long').max(1000, 'Comment cannot exceed 1000 characters'),
});

export const replyReviewSchema = z.object({
  sellerReply: z.string().min(2, 'Reply must be at least 2 characters long').max(1000, 'Reply cannot exceed 1000 characters'),
});

