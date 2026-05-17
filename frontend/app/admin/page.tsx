"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FiUser } from "react-icons/fi";
import { MdShield } from "react-icons/md";
import { Card } from "@/components/ui/card";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

const adminRoutes = [
  { slug: "schools", label: "Schools" },
  { slug: "schools/add", label: "Add School" },
  { slug: "schools/pending", label: "Pending Schools" },
  { slug: "users", label: "Users" },
  { slug: "moderation", label: "Moderation" },
  { slug: "inquiries", label: "Inquiries" },
  { slug: "featured", label: "Featured" },
  { slug: "blog", label: "Blog" },
  { slug: "seo", label: "SEO" },
  { slug: "analytics", label: "Analytics" },
  { slug: "cities", label: "Cities" },
  { slug: "payments", label: "Payments" },
  { slug: "audit-logs", label: "Audit Logs" },
];

type AdminInfo = { id: string; phone?: string; name?: string };

type AdminSchool = { id: string; status: "pending" | "approved" | "rejected" };
type AdminInquiry = { id: string; createdAt: string };

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

  const { data: schools } = useQuery({
    queryKey: ["admin-overview-schools"],
    enabled: !!admin,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/schools`, { headers: authHeaders() });
      if (!res.ok) return [] as AdminSchool[];
      const json = (await res.json()) as { data: AdminSchool[] };
      return json.data;
    },
  });

  const { data: inquiries } = useQuery({
    queryKey: ["admin-overview-inquiries"],
    enabled: !!admin,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/inquiries`, { headers: authHeaders() });
      if (!res.ok) return [] as AdminInquiry[];
      const json = (await res.json()) as { data: AdminInquiry[] };
      return json.data;
    },
  });

  const totalSchools = schools?.length ?? 0;
  const pendingApprovals = schools?.filter((s) => s.status === "pending").length ?? 0;
  const today = new Date().toDateString();
  const inquiriesToday =
    inquiries?.filter((i) => new Date(i.createdAt).toDateString() === today).length ?? 0;

  const stats = [
    { label: "Total Schools", value: totalSchools },
    { label: "Pending Approvals", value: pendingApprovals },
    { label: "Inquiries Today", value: inquiriesToday },
  ];

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

        {admin && (
          <div className="flex items-center gap-3 rounded-xl border border-[#D3D1C7] bg-white px-4 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FCE8E8] text-[#A32D2D]">
              <MdShield size={18} />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-[#042C53]">
                {admin.name ?? "SchoolSetu Admin"}
              </p>
              <p className="flex items-center gap-1 text-xs text-[#55534e]">
                <FiUser size={11} />
                {formatPhone(admin.phone) || admin.id}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs uppercase tracking-wide text-[#888780]">{stat.label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-[#0C447C]">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Tile grid */}
      <h2 className="mt-10 font-heading text-xl font-bold text-[#0C447C]">Sections</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {adminRoutes.map((route) => (
          <Card key={route.slug}>
            <Link href={`/admin/${route.slug}`} className="font-semibold text-[#185FA5]">
              {route.label}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
