import { z } from 'zod';

export const CreateUsedBookRequestSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

export const UpdateUsedBookRequestStatusSchema = z.object({
  status: z.enum([
    'requested',
    'seller_notified',
    'seller_contacted_buyer',
    'accepted',
    'declined',
    'in_discussion',
    'completed',
    'cancelled',
    'expired',
  ]),
  note: z.string().max(500).optional(),
});

export type CreateUsedBookRequestInput = z.infer<typeof CreateUsedBookRequestSchema>;
export type UpdateUsedBookRequestStatusInput = z.infer<typeof UpdateUsedBookRequestStatusSchema>;
