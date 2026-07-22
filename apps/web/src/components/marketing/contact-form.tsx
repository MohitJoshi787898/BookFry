'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/shared/button';

// Form validation schema matching backend Zod validator
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['General', 'Order Issue', 'Selling Question', 'Report a Listing', 'Partnership'], {
    errorMap: () => ({ message: 'Please select a valid subject category' }),
  }),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: undefined,
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ContactFormValues) =>
      apiClient('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    mutation.mutate(data);
  };

  // Dedicated Success State Confirmation Panel
  if (mutation.isSuccess) {
    return (
      <div className="border border-border/60 bg-surface rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-sm animate-scale font-sans">
        <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            Message Sent!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Thanks for reaching out to BookFry. We have received your inquiry and our support team typically replies within **24 hours** via email.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => mutation.reset()}
            className="text-xs font-semibold"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/60 bg-surface rounded-xl p-6 sm:p-8 shadow-xs font-sans space-y-6">
      {/* Error Submission Banner with Retry */}
      {mutation.isError && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-start space-x-3 text-xs font-sans text-danger animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold">That didn&apos;t go through — mind trying again?</p>
            <button
              onClick={handleSubmit(onSubmit)}
              className="inline-flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[10px] text-danger hover:underline focus:outline-none"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry Submission</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
        {/* Name input */}
        <div className="relative">
          <input
            id="name"
            type="text"
            placeholder=" "
            {...register('name')}
            className="block w-full px-4 pt-6 pb-2 text-sm text-text-primary bg-muted/40 border-b-2 border-transparent rounded-t-md focus:bg-muted/60 focus:border-primary focus:outline-none transition-all peer"
          />
          <label
            htmlFor="name"
            className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary pointer-events-none origin-[0] transform transition-all duration-200 -translate-y-3 scale-90 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-primary"
          >
            Your Name
          </label>
          {errors.name && (
            <p className="text-[10px] text-danger font-semibold mt-1.5 pl-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email input */}
        <div className="relative">
          <input
            id="email"
            type="email"
            placeholder=" "
            {...register('email')}
            className="block w-full px-4 pt-6 pb-2 text-sm text-text-primary bg-muted/40 border-b-2 border-transparent rounded-t-md focus:bg-muted/60 focus:border-primary focus:outline-none transition-all peer"
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary pointer-events-none origin-[0] transform transition-all duration-200 -translate-y-3 scale-90 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-primary"
          >
            Email Address
          </label>
          {errors.email && (
            <p className="text-[10px] text-danger font-semibold mt-1.5 pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Subject dropdown */}
        <div className="relative">
          <select
            id="subject"
            defaultValue=""
            {...register('subject')}
            className="block w-full px-4 pt-6 pb-2 text-sm text-text-primary bg-muted/40 border-b-2 border-transparent rounded-t-md focus:bg-muted/60 focus:border-primary focus:outline-none transition-all peer appearance-none"
          >
            <option value="" disabled hidden></option>
            <option value="General">General Support / Feedback</option>
            <option value="Order Issue">Order issue & Payout refunds</option>
            <option value="Selling Question">Seller listing guidance</option>
            <option value="Report a Listing">Report a copyright/fraud listing</option>
            <option value="Partnership">Partnership & Media</option>
          </select>
          <label
            htmlFor="subject"
            className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary pointer-events-none origin-[0] transform transition-all duration-200 -translate-y-3 scale-90 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-primary"
          >
            Subject Category
          </label>
          {errors.subject && (
            <p className="text-[10px] text-danger font-semibold mt-1.5 pl-1">
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Message textarea */}
        <div className="relative">
          <textarea
            id="message"
            rows={5}
            placeholder=" "
            {...register('message')}
            className="block w-full px-4 pt-6 pb-2 text-sm text-text-primary bg-muted/40 border-b-2 border-transparent rounded-t-md focus:bg-muted/60 focus:border-primary focus:outline-none transition-all peer"
          />
          <label
            htmlFor="message"
            className="absolute left-4 top-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary pointer-events-none origin-[0] transform transition-all duration-200 -translate-y-3 scale-90 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:text-primary"
          >
            Your Message
          </label>
          {errors.message && (
            <p className="text-[10px] text-danger font-semibold mt-1.5 pl-1">
              {errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="secondary"
          isLoading={mutation.isPending}
          className="w-full py-3 text-xs uppercase font-bold tracking-wider shadow"
          pill
        >
          {mutation.isPending ? 'Sending Message...' : 'Submit Support Ticket'}
        </Button>
      </form>
    </div>
  );
}

export default ContactForm;
