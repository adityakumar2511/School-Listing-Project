"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAuthToken } from "@/lib/auth-token";

// TODO: re-enable when Razorpay is configured. The payments endpoints currently
// all return HTTP 503 — this UI mirrors that disabled state.
export default function AdminPaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
      if (payload.role !== "admin") router.replace("/");
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="container-shell py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[#888780]">
        <Link href="/admin" className="hover:text-[#185FA5]">
          Admin
        </Link>
        <span>›</span>
        <span className="font-medium text-[#2C2C2A]">Payments</span>
      </nav>

      <div className="flex items-center gap-3">
        <h1 className="font-heading text-3xl font-bold text-[#042C53]">Payments</h1>
        <Badge tone="neutral">Coming soon</Badge>
      </div>
      <p className="mt-2 text-sm text-[#888780]">
        Razorpay-powered payment history for featured listings and premium plans.
      </p>

      <Card className="mt-8">
        <p className="text-sm leading-6 text-[#55534e]">
          All payment routes currently return <code className="rounded bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-xs">503</code>.
          Configure <code className="font-mono text-xs">RAZORPAY_KEY_ID</code>,{" "}
          <code className="font-mono text-xs">RAZORPAY_KEY_SECRET</code>, and{" "}
          <code className="font-mono text-xs">RAZORPAY_WEBHOOK_SECRET</code> in{" "}
          <code className="font-mono text-xs">backend/.env</code> and re-enable the
          {" "}<code className="font-mono text-xs">paymentsDisabled</code> middleware to activate this page.
        </p>
      </Card>
    </div>
  );
}
