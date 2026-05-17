"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authErrorMessage, postAuthJson } from "@/lib/auth-api";
import { navigateAfterAuth, redirectFromSearch, roleFromJwt } from "@/lib/auth-routing";
import { setAuthToken } from "@/lib/auth-token";
import { cn } from "@/lib/utils";

const emailLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type EmailLoginValues = z.infer<typeof emailLoginSchema>;

function inputClass(fieldError?: boolean) {
  return cn(
    "mt-1 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]",
    fieldError ? "border-[#A32D2D]" : "border-[var(--gray-100)]"
  );
}

export function AuthLoginColumn({ heading }: { heading: string }) {
  const router = useRouter();
  const [showPw, setShowPw] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  const [otpStep, setOtpStep] = React.useState<"phone" | "otp">("phone");
  const [phoneDigits, setPhoneDigits] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpPhoneError, setOtpPhoneError] = React.useState("");
  const [otpCodeError, setOtpCodeError] = React.useState("");
  const [otpBanner, setOtpBanner] = React.useState("");
  const [countdown, setCountdown] = React.useState(0);
  const [otpLoading, setOtpLoading] = React.useState(false);

  const [googleLoading, setGoogleLoading] = React.useState(false);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const emailForm = useForm<EmailLoginValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  React.useEffect(() => {
    if (countdown <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countdown]);

  async function onEmailSubmit(values: EmailLoginValues) {
    setLoginError("");
    const res = await postAuthJson<{ token?: string }>("/login", {
      email: values.email,
      password: values.password,
    });
    if (!res.ok || !res.data.token) {
      setLoginError(authErrorMessage(res.data));
      return;
    }
    setAuthToken(res.data.token);
    navigateAfterAuth(
      roleFromJwt(res.data.token),
      router,
      redirectFromSearch(window.location.search),
    );
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phoneDigits.replace(/\D/g, "");
    if (digits.length !== 10) {
      setOtpPhoneError("Enter a valid 10-digit phone number");
      return;
    }
    setOtpPhoneError("");
    setOtpBanner("");
    setOtpLoading(true);
    try {
      const res = await postAuthJson<{ message?: string }>("/send-otp", {
        phone: `+91${digits}`,
      });
      if (!res.ok) {
        setOtpPhoneError(authErrorMessage(res.data));
        return;
      }
      setOtpStep("otp");
      setCountdown(30);
      setOtpBanner(res.data.message ?? "OTP sent");
    } catch {
      setOtpPhoneError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phoneDigits.replace(/\D/g, "");
    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setOtpCodeError("Enter the 6-digit OTP");
      return;
    }
    setOtpCodeError("");
    setOtpLoading(true);
    try {
      const res = await postAuthJson<{ token?: string; error?: string }>("/verify-otp", {
        phone: `+91${digits}`,
        otp: cleanOtp,
      });
      if (!res.ok || !res.data.token) {
        setOtpCodeError(authErrorMessage(res.data));
        return;
      }
      setAuthToken(res.data.token);
      navigateAfterAuth(roleFromJwt(res.data.token), router, redirectFromSearch(window.location.search));
    } catch {
      setOtpCodeError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResend() {
    const digits = phoneDigits.replace(/\D/g, "");
    setCountdown(30);
    try {
      await postAuthJson("/send-otp", { phone: `+91${digits}` });
    } catch {
      // countdown still applies
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/auth/login",
      });
      if (result?.error) {
        setGoogleLoading(false);
        return;
      }
      if (result?.url) window.location.assign(result.url);
    } catch {
      setGoogleLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--gray-100)] bg-white p-5 shadow-sm md:p-6">
      <h2 className="font-heading text-lg font-bold text-[var(--blue-900)] md:text-xl">{heading}</h2>
      <p className="mt-1 text-xs text-[var(--gray-400)] md:text-sm">
        Choose a sign-in method below — same account works across SchoolSetu.
      </p>

      <Tabs defaultValue="email" className="mt-5">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-[var(--amber-50)] p-1">
          <TabsTrigger value="email" className="flex-1 text-xs md:text-sm">
            Email &amp; Password
          </TabsTrigger>
          <TabsTrigger value="otp" className="flex-1 text-xs md:text-sm">
            Mobile OTP
          </TabsTrigger>
          <TabsTrigger value="google" className="flex-1 text-xs md:text-sm">
            Google
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-4 border-0 bg-transparent p-0 shadow-none">
          <form className="space-y-4" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor={`email-${heading}`}>
                Email
              </label>
              <input
                id={`email-${heading}`}
                type="email"
                autoComplete="email"
                className={inputClass(Boolean(emailForm.formState.errors.email))}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-xs text-[#A32D2D]">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor={`pw-${heading}`}>
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id={`pw-${heading}`}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className={cn(inputClass(Boolean(emailForm.formState.errors.password)), "pr-11")}
                  {...emailForm.register("password")}
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
              {emailForm.formState.errors.password && (
                <p className="mt-1 text-xs text-[#A32D2D]">{emailForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-[var(--blue-600)] hover:underline">
                Forgot Password?
              </Link>
            </div>
            {loginError && (
              <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-xs text-[#A32D2D]" role="alert">
                {loginError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} /> : null}
              {emailForm.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp" className="mt-4 border-0 bg-transparent p-0 shadow-none">
          {otpStep === "phone" ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Phone number
                <div className="mt-1 flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--gray-100)] bg-[var(--gray-50)] px-3 text-sm text-[#55534e]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    value={phoneDigits}
                    onChange={(e) => {
                      setPhoneDigits(e.target.value.replace(/\D/g, ""));
                      setOtpPhoneError("");
                    }}
                    className={cn(inputClass(Boolean(otpPhoneError)), "rounded-l-none")}
                  />
                </div>
              </label>
              {otpPhoneError && <p className="text-xs text-[#A32D2D]">{otpPhoneError}</p>}
              <Button type="submit" className="w-full" disabled={otpLoading}>
                {otpLoading ? <FiLoader className="animate-spin" size={16} /> : null}
                {otpLoading ? "Sending…" : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="rounded-lg bg-[var(--blue-50)] px-4 py-3 text-sm text-[var(--blue-600)]">
                OTP sent to <strong>+91 {phoneDigits}</strong>
                <button type="button" className="ml-2 text-xs underline" onClick={() => setOtpStep("phone")}>
                  Change
                </button>
              </div>
              {otpBanner && <p className="text-xs text-[var(--gray-400)]">{otpBanner}</p>}
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Enter OTP
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="● ● ● ● ● ●"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setOtpCodeError("");
                  }}
                  className={cn(inputClass(Boolean(otpCodeError)), "text-center text-xl font-bold tracking-[0.35em]")}
                  autoFocus
                />
              </label>
              {otpCodeError && <p className="text-xs text-[#A32D2D]">{otpCodeError}</p>}
              <Button type="submit" className="w-full" disabled={otpLoading}>
                {otpLoading ? <FiLoader className="animate-spin" size={16} /> : null}
                {otpLoading ? "Verifying…" : "Verify & Sign in"}
              </Button>
              <div className="text-center text-xs text-[var(--gray-400)]">
                {countdown > 0 ? (
                  <span>Resend OTP in {countdown}s</span>
                ) : (
                  <button type="button" onClick={handleResend} className="font-semibold text-[var(--blue-600)] hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </TabsContent>

        <TabsContent value="google" className="mt-4 border-0 bg-transparent p-0 shadow-none">
          <div className="space-y-4">
            <p className="text-sm text-[#55534e]">
              Continue with your Google account. We&apos;ll link or create your SchoolSetu profile automatically.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--gray-100)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--blue-600)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.548 14.252 17.64 11.92 17.64 9.2z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
