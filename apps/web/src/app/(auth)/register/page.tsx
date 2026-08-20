"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { apiClient } from "@/lib/api-client";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import {
  Mail,
  Lock,
  User,
  Tag,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  Truck,
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

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
        body: JSON.stringify(values),
      });
      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();
      router.push("/");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] dark:bg-background text-text-primary">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Main signup container card */}
        <Card className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-md border-border bg-white dark:bg-card">
          {/* A. Left Column (Warm Cream Background / Dark Slate) */}
          <div className="bg-[#FEF8F3] dark:bg-primary-950/15 p-8 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-border">
            {/* Create Account Image */}
            <div className="w-full max-w-[220px] aspect-square flex items-center justify-center bg-white/40 dark:bg-white/95 rounded-2xl p-4 shadow-xs select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/create-account.png"
                alt="BookFry Create Account"
                className="w-full h-full object-contain select-none"
              />
            </div>

            {/* Editorial headings */}
            <div className="space-y-2 mt-4">
              <h2 className="font-serif text-2xl font-bold text-[#1A3B5C] dark:text-[#85B7E5]">
                Join BookFry Today
              </h2>
              <p className="text-xs text-text-secondary font-sans font-medium">
                Create an account to start your reading journey.
              </p>
            </div>

            {/* Trust points list */}
            <div className="w-full space-y-3.5 pt-6 border-t border-border/60 mt-6 font-sans text-xs text-left">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-[#F26522]" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Great Deals</p>
                  <p className="text-[10px] text-text-muted">Up to 80% Off</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-[#F26522]" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">100% Safe</p>
                  <p className="text-[10px] text-text-muted">Secure Shopping</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-[#F26522]" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Wide Collection</p>
                  <p className="text-[10px] text-text-muted">
                    Books for Everyone
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* B. Right Column (White Form Panel / Dark Card) */}
          <div className="bg-white dark:bg-card p-8 flex flex-col justify-center space-y-6 font-sans">
            <div className="space-y-1.5">
              <h1 className="font-serif text-2xl font-bold text-[#1A3B5C] dark:text-[#85B7E5]">
                Create your account
              </h1>
              <p className="text-xs text-text-secondary font-medium">
                Glad to have you! Fill details to register.
              </p>
            </div>

            {apiError && (
              <div className="p-3 bg-danger/5 border border-danger/20 rounded-md text-xs font-bold text-danger">
                {apiError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="Enter your full name"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register("name")}
              />

              {/* Email Address */}
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="Enter your email address"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              {/* Password Address */}
              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <PasswordStrengthIndicator password={passwordVal} />
              </div>

              {/* Terms checkbox */}
              <div className="pt-1">
                <Checkbox
                  required
                  label={
                    <span className="font-semibold text-text-secondary select-none">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-secondary hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      &{" "}
                      <Link
                        href="/privacy"
                        className="text-secondary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  }
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                loading={isSubmitting}
                variant="secondary"
                fullWidth
                className="uppercase tracking-wider py-2.5 text-xs font-bold rounded-lg"
              >
                Create Account
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center font-sans">
              <div className="flex-grow border-t border-border" />
              <span className="flex-shrink mx-4 text-[10px] font-bold text-text-muted uppercase">
                or continue with
              </span>
              <div className="flex-grow border-t border-border" />
            </div>

            {/* Social log buttons */}
            <SocialLogins />

            {/* Sign in bottom link */}
            <p className="text-center text-xs font-medium text-text-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#F26522] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </main>

      {/* Horizontal Trust bar */}
      <div className="bg-white dark:bg-card border-t border-b border-border/60 py-5 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between text-left">
            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-[#F26522]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                  Up to 80% Off
                </h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">
                  On New & Used Books
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-[#F26522]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                  Free Shipping
                </h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">
                  On orders over ₹499
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-[#F26522]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                  Quality Checked
                </h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">
                  100% Verified Books
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] dark:bg-secondary-950/40 border border-[#FFF0E8] dark:border-secondary-900/30 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-[#F26522]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                  Easy Returns
                </h4>
                <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">
                  Hassle-free returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
