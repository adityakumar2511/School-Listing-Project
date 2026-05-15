"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, GraduationCap, Loader2, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const OTP_LENGTH = 6;

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return value.startsWith("+") ? value : `+${digits}`;
}

function visiblePhone(value: string) {
  return value || "your phone number";
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") ?? "";
  const [phone, setPhone] = useState(initialPhone);
  const [phoneInput, setPhoneInput] = useState("");
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [shouldShake, setShouldShake] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const submittedOtpRef = useRef("");

  const otp = useMemo(() => digits.join(""), [digits]);
  const hasPhone = phone.trim().length > 0;

  useEffect(() => {
    if (!hasPhone || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasPhone, secondsLeft]);

  async function sendOtp(nextPhone = phone) {
    setError("");
    setPhoneError("");
    setIsSendingOtp(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone: nextPhone })
      });

      if (!response.ok) {
        throw new Error("Unable to send OTP");
      }

      setSecondsLeft(30);
    } catch {
      setError("Could not send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function submitPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawDigits = phoneInput.replace(/\D/g, "");
    if (rawDigits.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return;
    }

    const nextPhone = normalizePhone(rawDigits);
    setPhone(nextPhone);
    router.replace(`/auth/verify-otp?phone=${encodeURIComponent(nextPhone)}`);
    await sendOtp(nextPhone);
    window.requestAnimationFrame(() => inputsRef.current[0]?.focus());
  }

  const verifyOtp = useCallback(async (value: string) => {
    if (!phone || value.length !== OTP_LENGTH) return;

    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp: value })
      });

      const payload = (await response.json()) as {
        token?: string;
        error?: string;
        remainingAttempts?: number;
      };

      if (!response.ok) {
        const remaining = payload.remainingAttempts;
        throw new Error(
          remaining !== undefined
            ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining`
            : payload.error ?? "Invalid OTP"
        );
      }
      if (payload.token) {
        window.localStorage.setItem("schoolsetu_token", payload.token);
      }

      router.replace("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid OTP. Try again.");
      setShouldShake(true);
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      submittedOtpRef.current = "";
      window.setTimeout(() => setShouldShake(false), 450);
      window.requestAnimationFrame(() => inputsRef.current[0]?.focus());
    } finally {
      setIsVerifying(false);
    }
  }, [phone, router]);

  useEffect(() => {
    if (otp.length === OTP_LENGTH && !digits.includes("") && otp !== submittedOtpRef.current) {
      submittedOtpRef.current = otp;
      verifyOtp(otp);
    }
  }, [digits, otp, verifyOtp]);

  function handleDigitChange(index: number, value: string) {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);
    setError("");

    if (nextValue && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "");
    setDigits(nextDigits);
    setError("");

    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    window.requestAnimationFrame(() => inputsRef.current[nextFocusIndex]?.focus());
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1EFE8] px-4 py-10 text-[#2C2C2A]">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
      <div className="mx-auto mt-10 w-full max-w-md rounded-xl border border-[#D3D1C7] bg-white p-8 shadow-md md:mt-20">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#185FA5] hover:text-[#0C447C]">
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="mx-auto mt-5 grid h-14 w-14 place-items-center rounded-xl bg-[#E6F1FB] text-[#185FA5]">
          <GraduationCap size={30} />
        </div>

        <div className="mt-5 text-center">
          <h1 className="font-heading text-2xl font-bold text-[#0C447C]">Verify Phone</h1>
          <p className="mt-2 text-sm text-gray-500">
            {hasPhone ? `Enter the 6-digit OTP sent to ${visiblePhone(phone)}` : "Enter your phone number to receive an OTP"}
          </p>
        </div>

        {!hasPhone ? (
          <form onSubmit={submitPhone} className="mt-7 grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              Phone Number
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#D3D1C7] bg-[#F1EFE8] px-3 text-sm text-[#55534e]">
                  +91
                </span>
                <input
                  value={phoneInput}
                  onChange={(event) => {
                    setPhoneInput(event.target.value.replace(/\D/g, "").slice(0, 10));
                    setPhoneError("");
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  className={cn(
                    "w-full rounded-r-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-[#185FA5]",
                    phoneError ? "border-red-400" : "border-[#D3D1C7]"
                  )}
                />
              </div>
              {phoneError ? <span className="text-xs text-red-600">{phoneError}</span> : null}
            </label>

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isSendingOtp}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#EF9F27] px-4 font-semibold text-[#633806] transition hover:bg-[#d98c18] disabled:opacity-60"
            >
              {isSendingOtp ? <Loader2 className="animate-spin" size={18} /> : null}
              Send OTP
            </button>
          </form>
        ) : (
          <div className="mt-7">
            <div className={cn("flex justify-center gap-2", shouldShake && "animate-[shake_0.4s_ease-in-out]")}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  value={digit}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  maxLength={1}
                  disabled={isVerifying}
                  aria-label={`OTP digit ${index + 1}`}
                  className={cn(
                    "h-12 w-12 rounded-lg border text-center text-xl outline-none focus:ring-2 focus:ring-[#185FA5]",
                    error ? "border-red-400" : "border-[#D3D1C7]"
                  )}
                />
              ))}
            </div>

            {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p> : null}

            <div className="mt-5 flex items-center justify-center">
              {isVerifying ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#185FA5]">
                  <Loader2 className="animate-spin" size={16} />
                  Verifying OTP...
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => sendOtp()}
                  disabled={secondsLeft > 0 || isSendingOtp}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#185FA5] hover:bg-[#E6F1FB] disabled:cursor-not-allowed disabled:text-[#888780]"
                >
                  {isSendingOtp ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                  {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : "Resend OTP"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] bg-[#F1EFE8]" />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
