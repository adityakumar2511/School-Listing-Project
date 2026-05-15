"use client";

import { useEffect, useState } from "react";
import { Chrome, Loader2, Smartphone } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type NextAuthProviders = {
  google?: unknown;
};

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function redirectIfLoggedIn() {
      const token = window.localStorage.getItem("schoolsetu_token");
      if (token) {
        router.replace("/dashboard");
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          headers: {
            Accept: "application/json"
          }
        });
        const contentType = response.headers.get("content-type") ?? "";

        if (response.ok && contentType.includes("application/json")) {
          const session = await response.json();
          if (isMounted && session?.user) {
            router.replace("/dashboard");
          }
        }
      } catch {
        // NextAuth is not configured yet; login actions still remain usable.
      }
    }

    redirectIfLoggedIn();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function hasGoogleProvider() {
    try {
      const response = await fetch("/api/auth/providers", {
        headers: {
          Accept: "application/json"
        }
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (response.ok && contentType.includes("application/json")) {
        const providers = (await response.json()) as NextAuthProviders;
        return Boolean(providers?.google);
      }
    } catch {
      return false;
    }

    return false;
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      if (await hasGoogleProvider()) {
        await signIn("google", { callbackUrl: "/dashboard" });
        return;
      }

      setNotice("Setting up Google sign-in… use Phone OTP for now.");
    } catch {
      setNotice("Setting up Google sign-in… use Phone OTP for now.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handlePhoneOtp() {
    setIsOtpLoading(true);
    router.push("/auth/verify-otp?method=otp");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1EFE8] px-4 py-10">
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
        <Card className="w-full shadow-md">
          <h1 className="font-heading text-3xl font-bold text-[#042C53]">Login</h1>
          <p className="mt-2 text-sm leading-6 text-[#55534e]">
            Continue as parent, school admin, or platform admin.
          </p>
          {notice ? <p className="mt-4 rounded-lg bg-[#FAEEDA] px-3 py-2 text-sm text-[#633806]">{notice}</p> : null}
          <div className="mt-6 grid gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="border-[#185FA5] text-[#185FA5] hover:border-[#0C447C] hover:text-[#0C447C]"
            >
              {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} />}
              Continue with Google
            </Button>
            <Button type="button" variant="amber" onClick={handlePhoneOtp} disabled={isOtpLoading}>
              {isOtpLoading ? <Loader2 className="animate-spin" size={18} /> : <Smartphone size={18} />}
              Continue with Phone OTP
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
