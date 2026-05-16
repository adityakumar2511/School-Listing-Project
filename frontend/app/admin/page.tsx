"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAuthToken } from "@/lib/auth-token";

const adminRoutes = [
  "schools",
  "users",
  "moderation",
  "inquiries",
  "featured",
  "blog",
  "seo",
  "analytics",
  "cities",
  "payments",
  "audit-logs",
];

type AdminInfo = { id: string; phone?: string; name?: string };

function decodeAdminFromToken(token: string): AdminInfo | null {
  try {
    return JSON.parse(atob(token.split(".")[1] ?? "")) as AdminInfo;
  } catch {
    return null;
  }
}

function formatPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/parent/login");
      return;
    }
    const payload = decodeAdminFromToken(token);
    if (!payload) {
      router.replace("/auth/parent/login");
      return;
    }
    setAdmin(payload);
  }, [router]);

  return (
    <div className="container-shell py-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-4xl font-bold text-[#042C53]">Admin panel</h1>
          <p className="mt-1 text-sm text-[#888780]">
            Manage schools, users, content, and audit logs.
          </p>
        </div>

        {/* Logged-in admin pill */}
        {admin && (
          <div className="flex items-center gap-3 rounded-xl border border-[#D3D1C7] bg-white px-4 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FCE8E8] text-[#A32D2D]">
              <Shield size={18} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-[#042C53]">
                {admin.name ?? "SchoolSetu Admin"}
              </p>
              <p className="flex items-center gap-1 text-xs text-[#55534e]">
                <User size={11} />
                {formatPhone(admin.phone) || admin.id}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tile grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {adminRoutes.map((route) => (
          <Card key={route}>
            <Link
              href={`/admin/${route}`}
              className="font-semibold capitalize text-[#185FA5]"
            >
              {route.replace("-", " ")}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
