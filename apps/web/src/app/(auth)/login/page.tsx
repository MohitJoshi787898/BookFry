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
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Tag,
  ShieldCheck,
  BookOpen,
  Chrome,
  Facebook,
  Apple,
  RotateCcw,
  Truck,
  CheckCircle2,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex flex-col min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Main login container card */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-border bg-white overflow-hidden shadow-xs">
          {/* A. Left Column (Warm Cream Background) */}
          <div className="bg-[#FEF8F3] p-8 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-border">
            {/* Mascot Image */}
            <div className="w-full max-w-[220px] aspect-square flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fox_reading_17849114865545.png"
                alt="BookFry Fox Reading Mascot"
                className="w-full h-full object-contain mix-blend-multiply select-none"
              />
            </div>

            {/* Editorial headings */}
            <div className="space-y-2 mt-4">
              <h2 className="font-serif text-2xl font-bold text-[#1A3B5C]">
                Welcome Back!
              </h2>
              <p className="text-xs text-text-secondary font-sans font-medium">
                Login to continue your reading journey.
              </p>
            </div>

            {/* Trust points list */}
            <div className="w-full space-y-3.5 pt-6 border-t border-border/60 mt-6 font-sans text-xs text-left">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-[#F26522]" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Great Deals</p>
                  <p className="text-[10px] text-text-muted">Up to 80% Off</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-[#F26522]" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">100% Safe</p>
                  <p className="text-[10px] text-text-muted">Secure Shopping</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
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

          {/* B. Right Column (White Form Panel) */}
          <div className="bg-white p-8 flex flex-col justify-center space-y-6 font-sans">
            <div className="space-y-1.5">
              <h1 className="font-serif text-2xl font-bold text-[#1A3B5C]">
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
              className="space-y-4 text-xs"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-bold text-text-secondary">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    {...register("email")}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-[#F26522] ${
                      errors.email ? "border-danger" : "border-border"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-danger font-bold mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Address */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-text-secondary">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#F26522] font-bold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg bg-slate-50/50 text-text-primary focus:outline-none focus:ring-1 focus:ring-[#F26522] ${
                      errors.password ? "border-danger" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-danger font-bold mt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Options row */}
              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-text-secondary">
                  <input
                    type="checkbox"
                    className="rounded border-border text-brand focus:ring-brand accent-[#F26522]"
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#F26522] hover:bg-[#e05310] text-white font-bold rounded-lg uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border" />
              <span className="flex-shrink mx-4 text-[10px] font-bold text-text-muted uppercase">
                or continue with
              </span>
              <div className="flex-grow border-t border-border" />
            </div>

            {/* Social log buttons */}
            <div className="grid grid-cols-3 gap-3 text-xs font-bold font-sans">
              <button className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg bg-white hover:bg-slate-50 transition-all shadow-xs">
                <Chrome className="h-3.5 w-3.5 text-red-500" /> Google
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg bg-white hover:bg-slate-50 transition-all shadow-xs">
                <Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg bg-white hover:bg-slate-50 transition-all shadow-xs">
                <Apple className="h-3.5 w-3.5 text-slate-900" /> Apple
              </button>
            </div>

            {/* Create account bottom link */}
            <p className="text-center text-xs font-medium text-text-secondary">
              New to BookFry?{" "}
              <Link
                href="/register"
                className="font-bold text-[#F26522] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Horizontal Trust bar */}
      <div className="bg-white border-t border-b border-border/60 py-5 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-between text-left">
            <div className="flex items-center space-x-3.5 py-1">
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
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
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
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
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
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
              <div className="h-10 w-10 rounded-full bg-[#FFF5F0] border border-[#FFF0E8] flex items-center justify-center shrink-0">
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
