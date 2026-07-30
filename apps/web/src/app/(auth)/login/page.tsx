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
  Tag,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SocialLogins } from "@/components/ui/auth-components";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    try {
      const data = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();
      router.push("/");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || "Invalid email or password.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Main login container card */}
        <Card className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-md border-border bg-card">
          {/* A. Left Column */}
          <div className="bg-secondary/5 dark:bg-primary-950/15 p-8 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-border">
            {/* Mascot Image */}
            <div className="w-full max-w-[220px] aspect-square flex items-center justify-center bg-white/40 dark:bg-white/95 rounded-2xl p-4 shadow-xs select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fox_reading_17849114865545.png"
                alt="BookFry Fox Reading Mascot"
                className="w-full h-full object-contain select-none"
              />
            </div>

            {/* Editorial headings */}
            <div className="space-y-2 mt-4">
              <h2 className="font-serif text-2xl font-bold text-brand dark:text-foreground">
                Welcome Back!
              </h2>
              <p className="text-xs text-text-secondary font-sans font-medium">
                Login to continue your reading journey.
              </p>
            </div>

            {/* Trust points list */}
            <div className="w-full space-y-3.5 pt-6 border-t border-border/60 mt-6 font-sans text-xs text-left">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Great Deals</p>
                  <p className="text-[10px] text-text-muted">Up to 80% Off</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">100% Safe</p>
                  <p className="text-[10px] text-text-muted">Secure Shopping</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-secondary" />
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

          {/* B. Right Column */}
          <div className="bg-card p-8 flex flex-col justify-center space-y-6 font-sans">
            <div className="space-y-1.5">
              <h1 className="font-serif text-2xl font-bold text-brand dark:text-foreground">
                Sign in to BookFry
              </h1>
              <p className="text-xs text-text-secondary font-medium">
                Glad to see you again! Please login to continue.
              </p>
            </div>

            {apiError && (
              <div className="p-3 bg-danger/5 border border-danger/20 rounded-md text-xs font-bold text-danger">
                {apiError}
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
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
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-text-secondary select-none">
                    Password <span className="text-danger">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-secondary font-bold hover:underline text-[11px]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  placeholder="Enter your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              {/* Options row */}
              <div className="flex justify-between items-center pt-1 font-sans text-xs">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-text-secondary">
                  <input
                    type="checkbox"
                    className="rounded border-border text-brand focus:ring-brand accent-secondary"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="font-bold text-text-primary hover:underline"
                >
                  Login with OTP
                </button>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                loading={isSubmitting}
                variant="secondary"
                fullWidth
                className="uppercase tracking-wider py-2.5 text-xs font-bold rounded-lg"
              >
                Sign In
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

            {/* Create account bottom link */}
            <p className="text-center text-xs font-medium text-text-secondary">
              New to BookFry?{" "}
              <Link
                href="/register"
                className="font-bold text-secondary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </main>

      {/* Horizontal Trust bar */}
      <div className="bg-card border-t border-b border-border/60 py-5 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between text-left">
            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-secondary" />
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
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-secondary" />
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
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-secondary" />
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
              <div className="h-10 w-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-secondary" />
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
