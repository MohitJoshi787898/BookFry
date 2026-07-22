import { z } from 'zod';

export const contactSubmitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['General', 'Order Issue', 'Selling Question', 'Report a Listing', 'Partnership'], {
    errorMap: () => ({ message: 'Please select a valid subject' }),
  }),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
