import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  discountPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0, 'Stock must be non-negative').default(1),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  language: z.string().default('English'),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  pageCount: z.coerce.number().optional(),
  existingImages: z.union([z.array(z.string()), z.string()]).optional(),
  images: z.any().optional(),
});

export const updateBookSchema = createBookSchema.partial().extend({
  status: z.enum(['draft', 'pending', 'active', 'rejected', 'archived', 'sold', 'removed']).optional(),
});

export const queryBookSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
