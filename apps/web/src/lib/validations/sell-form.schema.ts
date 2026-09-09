import { z } from 'zod';

export const sellBookSchema = z
  .object({
    // Step 1: Book Details
    title: z.string().min(3, 'Ad Title must be at least 3 characters'),
    source: z.enum(['auto', 'manual']).default('auto'),
    isbn: z
      .string()
      .regex(/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits')
      .optional()
      .or(z.literal('')),
    author: z.string().min(2, 'Author name is required'),
    publisher: z.string().optional(),
    edition: z.string().optional(),
    category: z.string().min(1, 'Please select a book type / category'),
    condition: z.enum(['new', 'like_new', 'good', 'fair'], {
      required_error: 'Please select book condition',
    }),
    conditionNotes: z.string().max(500, 'Notes must be within 500 characters').optional(),
    images: z
      .array(z.any())
      .min(1, 'Please upload at least 1 image of your book')
      .max(4, 'Maximum 4 images allowed'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),

    // Step 2: Pricing Details
    price: z.coerce.number().min(1, 'Selling price must be greater than 0'),
    freeShipping: z.boolean().default(false),
    shippingFee: z.coerce.number().min(0).default(0),
    preferredPayment: z.enum(['upi', 'bank']).default('upi'),
    upiId: z.string().optional(),
    accountHolder: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),

    // Step 3: Seller Details
    sellerName: z.string().min(2, 'Seller name is required'),
    sellerEmail: z.string().email('Please enter a valid email address'),
    sellerPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
    hidePhone: z.boolean().default(false),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),

    // Step 4: Location / Pickup Address
    pickupAddress: z.string().optional(),

    // Step 5: Terms
    confirmOwnership: z.literal(true, {
      errorMap: () => ({ message: 'You must confirm that this book belongs to you' }),
    }),
    agreePolicy: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the marketplace policies' }),
    }),
  })
  .refine(
    (data) => {
      if (data.preferredPayment === 'upi') {
        return !!data.upiId && /^[\w.-]+@[\w.-]+$/.test(data.upiId);
      }
      return true;
    },
    {
      message: 'Please enter a valid UPI ID (e.g. name@upi)',
      path: ['upiId'],
    }
  )
  .refine(
    (data) => {
      if (data.preferredPayment === 'bank') {
        return (
          !!data.accountHolder &&
          !!data.bankName &&
          !!data.accountNumber &&
          !!data.ifscCode &&
          /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(data.ifscCode)
        );
      }
      return true;
    },
    {
      message: 'Please complete all bank details with a valid IFSC code',
      path: ['ifscCode'],
    }
  );

export type SellBookFormData = z.infer<typeof sellBookSchema>;
