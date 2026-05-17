"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAuthToken } from "@/lib/auth-token";

// TODO: re-enable when Razorpay is configured. Featured listings are sold as
// paid placements; until payments ship, this page is a read-only placeholder.
export default function AdminFeaturedPage() {
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
        <span className="font-medium text-[#2C2C2A]">Featured Listings</span>
      </nav>

      <div className="flex items-center gap-3">
        <h1 className="font-heading text-3xl font-bold text-[#042C53]">Featured Listings</h1>
        <Badge tone="neutral">Coming soon</Badge>
      </div>
      <p className="mt-2 text-sm text-[#888780]">
        Sell premium featured placements to schools. Powered by Razorpay (currently disabled).
      </p>

      <Card className="mt-8 space-y-3">
        <p className="text-sm leading-6 text-[#55534e]">
          Featured listings management will open once Razorpay payment integration is enabled.
          Until then, individual schools can be promoted via the toggle on the{" "}
          <Link href="/admin/schools" className="font-semibold text-[#185FA5] hover:underline">
            Schools admin page
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
