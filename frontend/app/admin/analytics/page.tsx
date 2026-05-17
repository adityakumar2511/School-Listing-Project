"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getAuthToken } from "@/lib/auth-token";

export default function AdminAnalyticsPage() {
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
        <span className="font-medium text-[#2C2C2A]">Analytics</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-[#042C53]">Analytics</h1>
      <p className="mt-2 text-sm text-[#888780]">
        Google Analytics and PostHog dashboards. Connect via{" "}
        <code className="rounded bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_GA_ID
        </code>{" "}
        and{" "}
        <code className="rounded bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_POSTHOG_KEY
        </code>
        .
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-heading text-lg font-bold text-[#0C447C]">Google Analytics</h2>
          <p className="mt-2 text-sm leading-6 text-[#55534e]">
            Page views, traffic sources, and conversion funnels. Dashboard available at{" "}
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#185FA5] hover:underline"
            >
              analytics.google.com
            </a>
            .
          </p>
        </Card>

        <Card>
          <h2 className="font-heading text-lg font-bold text-[#0C447C]">PostHog</h2>
          <p className="mt-2 text-sm leading-6 text-[#55534e]">
            Product analytics, feature flags, and session replays. Dashboard available at{" "}
            <a
              href="https://app.posthog.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#185FA5] hover:underline"
            >
              app.posthog.com
            </a>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
