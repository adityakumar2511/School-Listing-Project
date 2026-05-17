"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getAuthToken } from "@/lib/auth-token";

export default function AdminBlogPage() {
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
        <span className="font-medium text-[#2C2C2A]">Blog</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-[#042C53]">Blog Posts</h1>
      <p className="mt-2 text-sm text-[#888780]">
        Manage blog posts at{" "}
        <Link href="/blog" className="font-semibold text-[#185FA5] hover:underline">
          /blog
        </Link>
        . Backed by the <code className="font-mono text-xs">blog_posts</code> table.
      </p>

      <Card className="mt-8">
        <p className="text-sm leading-6 text-[#55534e]">
          The blog CMS editor is part of the upcoming content release. Posts can be created
          directly via Prisma in the meantime — the public blog list and post pages already render
          from the <code className="font-mono text-xs">blog_posts</code> table.
        </p>
      </Card>
    </div>
  );
}
