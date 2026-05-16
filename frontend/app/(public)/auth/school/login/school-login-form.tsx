"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthMethod = "email" | "phone";
type OtpStep = "phone" | "otp";

export function SchoolLoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("email");

  // Email + password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Phone OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setEmailError("Enter your email and password");
      return;
    }
    setEmailError("");
    setLoading(true);
    setTimeout(() => {
      console.log("School admin sign in:", email);
      setLoading(false);
      router.push("/school/dashboard");
    }, 800);
  }

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Enter a valid 10-digit phone number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    setTimeout(() => {
      console.log("Sending OTP to", `+91${digits}`);
      setLoading(false);
      setOtpStep("otp");
      setCountdown(30);
    }, 800);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length < 4) {
      setOtpError("Enter the OTP sent to your phone");
      return;
    }
    setOtpError("");
    setLoading(true);
    setTimeout(() => {
      console.log("Verifying OTP", otp, "for", phone);
      setLoading(false);
      router.push("/school/dashboard");
    }, 800);
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo + heading */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-heading text-2xl font-bold text-[#0C447C]">
          🎓 SchoolSetu
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
        {(["email", "phone"] as AuthMethod[]).map((m) => (
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
            {m === "email" ? "Email & Password" : "Phone OTP"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm">
        {/* Email + Password */}
        {method === "email" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <label className="block text-sm font-medium text-[#2C2C2A]">
              Email Address
              <input
                type="email"
                placeholder="principal@school.edu.in"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                className="mt-1 w-full rounded-lg border border-[#D3D1C7] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]"
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm font-medium text-[#2C2C2A]">
              Password
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setEmailError(""); }}
                  className="w-full rounded-lg border border-[#D3D1C7] bg-white py-2.5 pl-4 pr-12 text-sm outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888780] hover:text-[#2C2C2A]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            {emailError && <p className="text-xs text-[#A32D2D]">{emailError}</p>}
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#185FA5] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
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
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setPhoneError(""); }}
                      className="w-full rounded-r-lg border border-[#D3D1C7] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]"
                      autoComplete="tel-national"
                      required
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-xs text-[#A32D2D]">{phoneError}</p>}
                </label>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null}
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
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                    className="mt-1 w-full rounded-lg border border-[#D3D1C7] bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.5em] outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]"
                    autoFocus
                    required
                  />
                  {otpError && <p className="mt-1 text-xs text-[#A32D2D]">{otpError}</p>}
                </label>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                  {loading ? "Verifying…" : "Verify & Sign In"}
                </Button>
                <div className="text-center text-xs text-[#888780]">
                  {countdown > 0 ? (
                    <span>Resend OTP in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { console.log("Resending OTP to", phone); setCountdown(30); }}
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
          <Link href="/for-schools" className="font-semibold text-[#185FA5] hover:underline">
            Register here →
          </Link>
        </p>
        <p>
          Parent?{" "}
          <Link href="/auth/parent/login" className="font-semibold text-[#185FA5] hover:underline">
            Sign in here →
          </Link>
        </p>
      </div>
    </div>
  );
}
