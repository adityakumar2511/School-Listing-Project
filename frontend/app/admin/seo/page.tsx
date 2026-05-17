"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getAuthToken } from "@/lib/auth-token";

export default function AdminSeoPage() {
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
        <span className="font-medium text-[#2C2C2A]">SEO</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-[#042C53]">SEO Overrides</h1>
      <p className="mt-2 text-sm text-[#888780]">
        Override page titles, meta descriptions and copy for city, state, board and category pages.
      </p>

      <Card className="mt-8">
        <p className="text-sm leading-6 text-[#55534e]">
          SEO overrides are stored in the <code className="font-mono text-xs">seo_pages</code>{" "}
          table. UI for editing entries inline ships with the next release — until then, edit rows
          directly via Prisma Studio and ISR will pick up changes on the next revalidation cycle
          (3600s).
        </p>
      </Card>
    </div>
  );
}
