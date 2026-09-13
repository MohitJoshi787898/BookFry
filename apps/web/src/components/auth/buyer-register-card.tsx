'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import {
  Mail,
  Lock,
  User,
  Tag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  SocialLogins,
  PasswordStrengthIndicator,
} from '@/components/ui/auth-components';

const buyerRegisterSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type BuyerRegisterFormValues = z.infer<typeof buyerRegisterSchema>;

interface BuyerRegisterCardProps {
  onSwitchToSeller?: () => void;
}

export function BuyerRegisterCard({ onSwitchToSeller }: BuyerRegisterCardProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BuyerRegisterFormValues>({
    resolver: zodResolver(buyerRegisterSchema),
  });
  const passwordVal = watch('password');

  const onSubmit = async (values: BuyerRegisterFormValues) => {
    setApiError(null);
    try {
      const data = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          roles: ['customer'],
        }),
      });
      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();

      router.push('/books');
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setApiError(
        error.message || 'Registration failed. An account with this email may already exist.'
      );
    }
  };

  const isDuplicateEmail =
    apiError?.toLowerCase().includes('already exists') ||
    apiError?.toLowerCase().includes('registered');

  return (
    <Card className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-xl border-border bg-card rounded-3xl">
      {/* Left Column (Mascot & Buyer Value Props) */}
      <div className="bg-secondary/5 dark:bg-primary-950/15 p-8 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-border font-sans">
        <div className="w-full max-w-[200px] aspect-square flex items-center justify-center bg-white/50 dark:bg-white/95 rounded-2xl p-4 shadow-xs select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/create-account.png"
            alt="BookFry Student Mascot"
            className="w-full h-full object-contain select-none"
          />
        </div>

        <div className="space-y-2 mt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Student Reader Account</span>
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-brand dark:text-foreground">
            Save Up to 80% on Books
          </h2>
          <p className="text-xs text-text-secondary font-medium">
            Join 50,000+ students buying verified textbooks directly from college peers.
          </p>
        </div>

        {/* Trust points list */}
        <div className="w-full space-y-3 pt-6 border-t border-border/60 mt-6 text-xs text-left">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-bold text-text-primary">Peer-to-Peer Prices</p>
              <p className="text-[10px] text-text-muted">Save thousands every college semester</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-bold text-text-primary">100% Safe Escrow Protection</p>
              <p className="text-[10px] text-text-muted">Payment held securely until verified receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <RotateCcw className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-bold text-text-primary">Easy Campus Returns</p>
              <p className="text-[10px] text-text-muted">Protection against missing or torn pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Buyer Form) */}
      <div className="bg-card p-8 flex flex-col justify-center space-y-4 font-sans">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand dark:text-foreground">
            Create Buyer Account
          </h1>
          <p className="text-xs text-text-secondary font-medium">
            Sign up in 10 seconds to browse and purchase books.
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-xs font-bold text-danger flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p>{apiError}</p>
              {isDuplicateEmail && (
                <Link href="/login" className="underline font-black block mt-1">
                  Click here to sign in with your password →
                </Link>
              )}
            </div>
          </div>
        )}

        <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name *"
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="student@university.edu.in or name@gmail.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-2">
            <Input
              label="Password *"
              type="password"
              required
              placeholder="Create a strong password (min 8 chars)"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrengthIndicator password={passwordVal} />
          </div>

          <div className="pt-1">
            <Checkbox
              required
              label={
                <span className="font-semibold text-text-secondary select-none">
                  I agree to BookFry&apos;s{' '}
                  <Link href="/terms" className="text-secondary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  &{' '}
                  <Link href="/privacy" className="text-secondary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              }
            />
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            variant="secondary"
            fullWidth
            className="uppercase tracking-wider py-2.5 text-xs font-bold rounded-xl"
          >
            <span>Create Free Buyer Account</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Dedicated Switch Callout Banner */}
        {onSwitchToSeller && (
          <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/20 flex items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-xs text-foreground">Want to sell your books?</p>
              <p className="text-[10px] text-muted-foreground">List unlimited books for free & get UPI payouts.</p>
            </div>
            <button
              type="button"
              onClick={onSwitchToSeller}
              className="px-3 py-1.5 rounded-xl bg-secondary text-white font-extrabold text-[11px] hover:bg-secondary/90 shrink-0 transition-all shadow-2xs cursor-pointer"
            >
              Seller Register →
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border" />
          <span className="flex-shrink mx-4 text-[10px] font-bold text-text-muted uppercase">
            or continue with
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <SocialLogins />

        <p className="text-center text-xs font-medium text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-secondary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default BuyerRegisterCard;
