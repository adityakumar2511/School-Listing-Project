"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authErrorMessage, postAuthJson } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

const emailStepSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

type EmailStepValues = z.infer<typeof emailStepSchema>;

const resetStepSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetStepValues = z.infer<typeof resetStepSchema>;

function inputClass(fieldError?: boolean) {
  return cn(
    "mt-1 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]",
    fieldError ? "border-[#A32D2D]" : "border-[var(--gray-100)]"
  );
}

export function ForgotPasswordClient() {
  const router = useRouter();
  const [phase, setPhase] = React.useState<"email" | "reset">("email");
  const [resetEmail, setResetEmail] = React.useState("");
  const [banner, setBanner] = React.useState("");
  const [apiError, setApiError] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);

  const emailForm = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetStepValues>({
    resolver: zodResolver(resetStepSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function onRequestReset(values: EmailStepValues) {
    setApiError("");
    const emailNorm = values.email.trim().toLowerCase();
    const res = await postAuthJson<{ message?: string }>("/forgot-password", { email: emailNorm });
    if (!res.ok) {
      setApiError(authErrorMessage(res.data));
      return;
    }
    setResetEmail(emailNorm);
    setPhase("reset");
    setBanner(res.data.message ?? "If an account exists for this email, we sent a reset code.");
    resetForm.reset();
  }

  async function onResetPassword(values: ResetStepValues) {
    setApiError("");
    const res = await postAuthJson<{ message?: string }>("/reset-password", {
      email: resetEmail,
      otp: values.otp,
      newPassword: values.newPassword,
    });
    if (!res.ok) {
      setApiError(authErrorMessage(res.data));
      return;
    }
    router.replace("/auth/login");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-sm md:p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-[var(--blue-900)]">Reset password</h1>
          <p className="mt-2 text-sm text-[var(--gray-400)]">
            {phase === "email"
              ? "Enter your email and we’ll send a one-time code."
              : "Enter the code from your email and choose a new password."}
          </p>
        </div>

        {phase === "email" ? (
          <form className="mt-8 space-y-4" onSubmit={emailForm.handleSubmit(onRequestReset)}>
            <div>
              <label className="text-sm font-medium" htmlFor="fp-email">
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                className={inputClass(Boolean(emailForm.formState.errors.email))}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[#A32D2D]">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            {apiError && (
              <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-xs text-[#A32D2D]" role="alert">
                {apiError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} /> : null}
              {emailForm.formState.isSubmitting ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={resetForm.handleSubmit(onResetPassword)}>
            {banner && (
              <p className="rounded-lg border border-[var(--amber-400)]/40 bg-[var(--amber-50)] px-4 py-3 text-sm text-[var(--amber-800)]">
                {banner}
              </p>
            )}
            <p className="text-xs text-[var(--gray-400)]">
              Resetting password for <strong className="text-[var(--foreground)]">{resetEmail}</strong>
            </p>
            <div>
              <label className="text-sm font-medium" htmlFor="fp-otp">
                One-time code
              </label>
              <input
                id="fp-otp"
                inputMode="numeric"
                maxLength={6}
                className={cn(
                  inputClass(Boolean(resetForm.formState.errors.otp)),
                  "text-center text-xl font-bold tracking-[0.35em]"
                )}
                {...resetForm.register("otp", {
                  setValueAs: (v) => String(v ?? "").replace(/\D/g, ""),
                })}
              />
              {resetForm.formState.errors.otp && (
                <p className="mt-1 text-xs text-[#A32D2D]">{resetForm.formState.errors.otp.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="fp-np">
                New password
              </label>
              <div className="relative mt-1">
                <input
                  id="fp-np"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className={cn(inputClass(Boolean(resetForm.formState.errors.newPassword)), "pr-11")}
                  {...resetForm.register("newPassword")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--foreground)]"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {resetForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-[#A32D2D]">{resetForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="fp-np2">
                Confirm new password
              </label>
              <div className="relative mt-1">
                <input
                  id="fp-np2"
                  type={showPw2 ? "text" : "password"}
                  autoComplete="new-password"
                  className={cn(inputClass(Boolean(resetForm.formState.errors.confirmPassword)), "pr-11")}
                  {...resetForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--foreground)]"
                  onClick={() => setShowPw2((v) => !v)}
                  aria-label={showPw2 ? "Hide password" : "Show password"}
                >
                  {showPw2 ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {resetForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#A32D2D]">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            {apiError && (
              <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-xs text-[#A32D2D]" role="alert">
                {apiError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
              {resetForm.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} /> : null}
              {resetForm.formState.isSubmitting ? "Updating…" : "Update password"}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs font-semibold text-[var(--blue-600)] hover:underline"
              onClick={() => {
                setPhase("email");
                setApiError("");
                setBanner("");
              }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-[var(--gray-400)]">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--blue-600)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
