import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  parentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID')
    .nullable()
    .optional(),
  imageUrl: z.string().url().optional(),
  order: z.number().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
