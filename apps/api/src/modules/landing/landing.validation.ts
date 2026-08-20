import { z } from 'zod';

export const createSectionSchema = z.object({
  sectionId: z.string().min(2).max(50),
  type: z.enum([
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
  ]),
  title: z.string().min(1).max(150),
  subtitle: z.string().optional(),
  enabled: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
  order: z.number().optional(),
  content: z.record(z.any()).optional(),
});

export const updateSectionSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  subtitle: z.string().optional(),
  enabled: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
  order: z.number().optional(),
  content: z.record(z.any()).optional(),
});

export const reorderSectionsSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export const updateLandingSeoSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().min(1).max(500).optional(),
  keywords: z.array(z.string()).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
});
