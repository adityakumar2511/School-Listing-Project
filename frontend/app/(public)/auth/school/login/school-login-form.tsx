"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { setAuthToken } from "@/lib/auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthMethod = "google" | "phone";
type OtpStep = "phone" | "otp";

export function SchoolLoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [method, setMethod] = useState<AuthMethod>("google");

  // Phone OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // After Google OAuth completes, sync backend token then redirect by role.
  useEffect(() => {
    if (status === "authenticated" && session?.backendToken) {
      setAuthToken(session.backendToken);
      const role = session.backendUser?.role;
      if (role === "admin") router.replace("/admin");
      else if (role === "school") router.replace("/school/dashboard");
      else router.replace("/dashboard");
    }
  }, [status, session?.backendToken, session?.backendUser?.role, router]);

  useEffect(() => {
    if (countdown <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countdown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Enter a valid 10-digit phone number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${digits}` }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setPhoneError(data.error ?? "Failed to send OTP. Please try again.");
        return;
      }
      setOtpStep("otp");
      setCountdown(30);
    } catch {
      setPhoneError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length !== 6) {
      setOtpError("Enter the 6-digit OTP sent to your phone");
      return;
    }
    setOtpError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, otp }),
      });
      const data = (await res.json()) as {
        token?: string;
        user?: { role: string };
        error?: string;
      };
      if (!res.ok) {
        setOtpError(data.error ?? "Invalid OTP. Please try again.");
        return;
      }
      if (data.token) setAuthToken(data.token);
      const role = data.user?.role;
      if (role === "admin") router.push("/admin");
      else if (role === "school") router.push("/school/dashboard");
      else router.push("/dashboard");
    } catch {
      setOtpError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const digits = phone.replace(/\D/g, "");
    setCountdown(30);
    try {
      await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${digits}` }),
      });
    } catch {
      // silent — countdown still runs
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/auth/school/login",
      });
      if (result?.error) {
        setGoogleLoading(false);
        return;
      }
      if (result?.url) {
        window.location.assign(result.url);
      }
    } catch {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-2xl font-bold text-[#0C447C]"
        >
          SchoolSetu
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-bold text-[#042C53]">
          School Admin Login
        </h1>
        <p className="mt-2 text-sm text-[#888780]">
          Manage your school listings and inquiries
        </p>
      </div>

      {/* Method tabs */}
      <div className="mb-4 flex rounded-xl border border-[#D3D1C7] bg-white p-1">
        {(["google", "phone"] as AuthMethod[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              method === m
                ? "bg-[#185FA5] text-white shadow-sm"
                : "text-[#888780] hover:text-[#2C2C2A]"
            }`}
          >
            {m === "google" ? "Google" : "Phone OTP"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm">
        {/* Google */}
        {method === "google" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#D3D1C7] bg-white px-4 py-3 text-sm font-semibold text-[#2C2C2A] shadow-sm transition hover:border-[#185FA5] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.548 14.252 17.64 11.92 17.64 9.2z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
              )}
              {googleLoading ? "Redirecting to Google…" : "Sign in with Google"}
            </button>
            <p className="text-center text-xs text-[#888780]">
              Use the same Google account you registered your school with.
            </p>
          </div>
        )}

        {/* Phone OTP */}
        {method === "phone" && (
          <>
            {otpStep === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <label className="block text-sm font-medium text-[#2C2C2A]">
                  Phone Number
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#D3D1C7] bg-[#F1EFE8] px-3 text-sm text-[#55534e]">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        setPhoneError("");
                      }}
                      className="w-full rounded-r-lg border border-[#D3D1C7] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]"
                      autoComplete="tel-national"
                      required
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{phoneError}</p>
                  )}
                </label>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <FiLoader className="animate-spin" size={16} /> : null}
                  {loading ? "Sending…" : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-lg bg-[#E6F1FB] px-4 py-3 text-sm text-[#185FA5]">
                  OTP sent to <strong>+91 {phone}</strong>
                  <button
                    type="button"
                    className="ml-2 text-xs underline"
                    onClick={() => setOtpStep("phone")}
                  >
                    Change
                  </button>
                </div>
                <label className="block text-sm font-medium text-[#2C2C2A]">
                  Enter OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="● ● ● ● ● ●"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setOtpError("");
                    }}
                    className="mt-1 w-full rounded-lg border border-[#D3D1C7] bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.5em] outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]"
                    autoFocus
                    required
                  />
                  {otpError && <p className="mt-1 text-xs text-[#A32D2D]">{otpError}</p>}
                </label>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <FiLoader className="animate-spin" size={16} /> : null}
                  {loading ? "Verifying…" : "Verify & Sign In"}
                </Button>
                <div className="text-center text-xs text-[#888780]">
                  {countdown > 0 ? (
                    <span>Resend OTP in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-semibold text-[#185FA5] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 space-y-2 text-center text-sm text-[#888780]">
        <p>
          New school?{" "}
          <Link
            href="/auth/school/register"
            className="font-semibold text-[#185FA5] hover:underline"
          >
            Register here →
          </Link>
        </p>
        <p>
          Parent?{" "}
          <Link
            href="/auth/parent/login"
            className="font-semibold text-[#185FA5] hover:underline"
          >
            Sign in here →
          </Link>
        </p>
      </div>
    </div>
  );
}
