"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { apiClient } from "@/lib/api-client";
import { Navbar } from "@/components/shared/navbar";
import {
  Mail,
  Lock,
  User,
  Tag,
  ShieldCheck,
  RotateCcw,
  Truck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  SocialLogins,
  PasswordStrengthIndicator,
} from "@/components/ui/auth-components";

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterFormContent() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  const passwordVal = watch("password");

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);
    try {
      const data = await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          roles: ["customer"],
        }),
      });
      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();

      router.push("/books");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || "Registration failed. Email may already be registered.");
    }
  };

  return (
    <Card className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-xl border-border bg-card rounded-3xl">
      {/* Left Column (Mascot & Buyer Value Props) */}
      <div className="bg-secondary/5 dark:bg-primary-950/15 p-8 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-border">
        <div className="w-full max-w-[220px] aspect-square flex items-center justify-center bg-white/40 dark:bg-white/95 rounded-2xl p-4 shadow-xs select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/create-account.png"
            alt="BookFry Create Account"
            className="w-full h-full object-contain select-none"
          />
        </div>

        <div className="space-y-2 mt-4">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Student Verified</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-brand dark:text-foreground">
            Join BookFry Today
          </h2>
          <p className="text-xs text-text-secondary font-sans font-medium">
            Create an account to start saving up to 80% on textbooks and academic essentials.
          </p>
        </div>

        {/* Trust points list */}
        <div className="w-full space-y-3 pt-6 border-t border-border/60 mt-6 font-sans text-xs text-left">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-bold text-text-primary">Up to 80% Off</p>
              <p className="text-[10px] text-text-muted">Verified pre-owned and new books</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-bold text-text-primary">100% Safe Escrow Guarantee</p>
              <p className="text-[10px] text-text-muted">Protection against missing or damaged pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Lightweight Buyer Form) */}
      <div className="bg-card p-8 flex flex-col justify-center space-y-4 font-sans">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-brand dark:text-foreground">
            Create Buyer Account
          </h1>
          <p className="text-xs text-text-secondary font-medium">
            Sign up in 10 seconds to start purchasing books.
          </p>
        </div>

        {apiError && (
          <div className="p-3 bg-danger/5 border border-danger/20 rounded-md text-xs font-bold text-danger">
            {apiError}
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
            {...register("name")}
          />

          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="Enter your email address"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="space-y-2">
            <Input
              label="Password *"
              type="password"
              required
              placeholder="Create a strong password (min 8 chars)"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrengthIndicator password={passwordVal} />
          </div>

          <div className="pt-1">
            <Checkbox
              required
              label={
                <span className="font-semibold text-text-secondary select-none">
                  I agree to the{" "}
                  <Link href="/terms" className="text-secondary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  &{" "}
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

        {/* Dedicated Seller Callout Banner */}
        <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/20 flex items-center justify-between gap-3">
          <div>
            <p className="font-extrabold text-xs text-foreground">Want to sell textbooks?</p>
            <p className="text-[10px] text-muted-foreground">List unlimited books for free & get UPI payouts.</p>
          </div>
          <Link
            href="/seller/register"
            className="px-3 py-1.5 rounded-xl bg-secondary text-white font-extrabold text-[11px] hover:bg-secondary/90 shrink-0 transition-all shadow-2xs"
          >
            Seller Register →
          </Link>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center font-sans">
          <div className="flex-grow border-t border-border" />
          <span className="flex-shrink mx-4 text-[10px] font-bold text-text-muted uppercase">
            or continue with
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <SocialLogins />

        <p className="text-center text-xs font-medium text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-secondary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-96 w-full max-w-4xl bg-card border border-border rounded-2xl animate-pulse" />}>
          <RegisterFormContent />
        </Suspense>
      </main>

      <div className="bg-card border-t border-b border-border/60 py-5 font-sans">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between text-left">
            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Up to 80% Off</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">On New & Used Books</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Free Shipping</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">On orders over ₹499</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Quality Checked</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">100% Verified Books</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Easy Returns</h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">Hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
