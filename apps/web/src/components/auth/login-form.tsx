"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validations/auth-schemas";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";
import { useCartStore } from "@/stores/cart.store";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { IconInputField } from "../shared/icon-input-field";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setScreen, closeModal, redirectTo } = useAuthModalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormData) => {
    setApiError(null);
    try {
      const data = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      setAuth(data.user, data.accessToken);
      await useCartStore.getState().syncCart();

      closeModal();

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setApiError(error.message || "Invalid email or password credentials.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-text-primary">
          Welcome back to Bookfry
        </h3>
        <p className="mt-1 text-xs text-text-secondary">
          Sign in to manage your listings, orders, and seller dashboard.
        </p>
      </div>

      {/* aria-live so screen reader users hear a failed login attempt,
          not just sighted users seeing the red banner appear */}
      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 rounded-md border border-danger/20 bg-danger/10 p-3.5 text-xs font-semibold text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <IconInputField
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@domain.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <IconInputField
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          headerSlot={
            <button
              type="button"
              onClick={() => setScreen("forgot_password")}
              className="focus-ring rounded text-xs font-semibold text-brand hover:underline"
            >
              Forgot password?
            </button>
          }
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded text-text-muted hover:text-text-primary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-text-secondary">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="focus-ring rounded border-border text-brand"
            />
            <span>Remember me on this browser</span>
          </label>
        </div>

        {/* Was bg-brand (navy) — switched to secondary (orange) so the
            primary action inside the modal matches the orange "Login /
            Sign up" button in the navbar that opened it, instead of
            switching accent color mid-flow. */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-secondary py-3 text-xs font-bold uppercase tracking-wider text-secondary-foreground shadow transition-colors hover:bg-secondary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      <div className="border-t border-border pt-4 text-center text-xs text-text-secondary">
        Don&apos;t have a Bookfry account yet?{" "}
        <button
          type="button"
          onClick={() => setScreen("signup")}
          className="focus-ring rounded font-bold text-brand hover:underline"
        >
          Create free account
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
