"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authErrorMessage, postAuthJson } from "@/lib/auth-api";
import { navigateAfterAuth, redirectFromSearch, roleFromJwt } from "@/lib/auth-routing";
import { setAuthToken } from "@/lib/auth-token";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    phone: z.string().trim(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((val, ctx) => {
    const digits = val.phone.replace(/\D/g, "");
    if (digits.length === 0) return;
    if (!/^[6-9]\d{9}$/.test(digits)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid 10-digit Indian mobile or leave blank",
        path: ["phone"],
      });
    }
  });

type RegisterValues = z.infer<typeof registerSchema>;

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type OtpValues = z.infer<typeof otpSchema>;

function inputClass(fieldError?: boolean) {
  return cn(
    "mt-1 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]",
    fieldError ? "border-[#A32D2D]" : "border-[var(--gray-100)]"
  );
}

export function RegisterParentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = React.useState<"form" | "otp">("form");
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [otpSuccess, setOtpSuccess] = React.useState("");

  const regForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", phone: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onRegister(values: RegisterValues) {
    setFormError("");
    const digits = values.phone.replace(/\D/g, "");
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      ...(digits.length ? { phone: `+91${digits}` } : {}),
    };

    const res = await postAuthJson<{ message?: string }>("/register/parent", payload);
    if (!res.ok) {
      setFormError(authErrorMessage(res.data));
      return;
    }
    setRegisteredEmail(values.email.trim().toLowerCase());
    setPhase("otp");
    otpForm.reset();
    setOtpSuccess(res.data.message ?? "Check your email for a verification code.");
  }

  async function onVerifyOtp(values: OtpValues) {
    setOtpError("");
    const res = await postAuthJson<{ token?: string }>("/verify-email-otp", {
      email: registeredEmail,
      otp: values.otp,
    });
    if (!res.ok || !res.data.token) {
      setOtpError(authErrorMessage(res.data));
      return;
    }
    setAuthToken(res.data.token);
    const nextPath = searchParams.get("next");
    if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
      router.replace(nextPath);
      return;
    }
    navigateAfterAuth(roleFromJwt(res.data.token), router, redirectFromSearch(window.location.search));
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-[var(--blue-50)] text-[var(--blue-600)]">
            <MdSchool size={28} />
          </span>
        </div>

        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-[var(--blue-900)]">Create parent account</h1>
          <p className="mt-2 text-sm text-[var(--gray-400)]">
            Register to save schools, send inquiries, and get recommendations.
          </p>
        </div>

        {phase === "form" ? (
          <form className="mt-8 space-y-4" onSubmit={regForm.handleSubmit(onRegister)}>
            <div>
              <label className="text-sm font-medium" htmlFor="rp-name">
                Full name
              </label>
              <input id="rp-name" className={inputClass(Boolean(regForm.formState.errors.name))} {...regForm.register("name")} />
              {regForm.formState.errors.name && (
                <p className="mt-1 text-xs text-[#A32D2D]">{regForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="rp-email">
                Email
              </label>
              <input
                id="rp-email"
                type="email"
                autoComplete="email"
                className={inputClass(Boolean(regForm.formState.errors.email))}
                {...regForm.register("email")}
              />
              {regForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[#A32D2D]">{regForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="rp-phone">
                Phone <span className="font-normal text-[var(--gray-400)]">(optional)</span>
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--gray-100)] bg-[var(--gray-50)] px-3 text-sm text-[#55534e]">
                  +91
                </span>
                <input
                  id="rp-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  className={cn(inputClass(Boolean(regForm.formState.errors.phone)), "rounded-l-none")}
                  {...regForm.register("phone")}
                />
              </div>
              {regForm.formState.errors.phone && (
                <p className="mt-1 text-xs text-[#A32D2D]">{regForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="rp-pw">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="rp-pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className={cn(inputClass(Boolean(regForm.formState.errors.password)), "pr-11")}
                  {...regForm.register("password")}
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
              {regForm.formState.errors.password && (
                <p className="mt-1 text-xs text-[#A32D2D]">{regForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="rp-pw2">
                Confirm password
              </label>
              <div className="relative mt-1">
                <input
                  id="rp-pw2"
                  type={showPw2 ? "text" : "password"}
                  autoComplete="new-password"
                  className={cn(inputClass(Boolean(regForm.formState.errors.confirmPassword)), "pr-11")}
                  {...regForm.register("confirmPassword")}
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
              {regForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#A32D2D]">{regForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-[var(--blue-600)] hover:underline">
                Forgot password?
              </Link>
            </div>

            {formError && (
              <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-xs text-[#A32D2D]" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={regForm.formState.isSubmitting}>
              {regForm.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} /> : null}
              {regForm.formState.isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={otpForm.handleSubmit(onVerifyOtp)}>
            <div className="rounded-lg border border-[var(--amber-400)]/40 bg-[var(--amber-50)] px-4 py-3 text-sm text-[var(--amber-800)]">
              We sent a 6-digit code to <strong>{registeredEmail}</strong>
            </div>
            {otpSuccess && <p className="text-xs text-[var(--gray-400)]">{otpSuccess}</p>}
            <div>
              <label className="text-sm font-medium" htmlFor="rp-otp">
                Verification code
              </label>
              <input
                id="rp-otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="● ● ● ● ● ●"
                className={cn(
                  inputClass(Boolean(otpForm.formState.errors.otp)),
                  "text-center text-xl font-bold tracking-[0.35em]"
                )}
                {...otpForm.register("otp", {
                  setValueAs: (v) => String(v ?? "").replace(/\D/g, ""),
                })}
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-1 text-xs text-[#A32D2D]">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>
            {otpError && (
              <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-xs text-[#A32D2D]" role="alert">
                {otpError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} /> : null}
              {otpForm.formState.isSubmitting ? "Verifying…" : "Verify & continue"}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs font-semibold text-[var(--blue-600)] hover:underline"
              onClick={() => {
                setPhase("form");
                setOtpSuccess("");
                setOtpError("");
              }}
            >
              ← Edit registration details
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-[var(--gray-400)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--blue-600)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
