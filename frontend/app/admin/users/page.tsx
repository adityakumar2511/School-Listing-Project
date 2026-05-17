"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FiLoader } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

type AdminUser = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: "admin" | "school" | "parent";
  createdAt: string;
};

const ROLE_TONE: Record<AdminUser["role"], "danger" | "amber" | "blue"> = {
  admin: "danger",
  school: "amber",
  parent: "blue",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { router.replace("/auth/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
      if (payload.role !== "admin") router.replace("/");
    } catch { router.replace("/auth/login"); }
  }, [router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load users");
      const json = (await res.json()) as { data: AdminUser[] };
      return json.data;
    },
  });

  return (
    <div className="container-shell py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[#888780]">
        <Link href="/admin" className="hover:text-[#185FA5]">Admin</Link>
        <span>›</span>
        <span className="font-medium text-[#2C2C2A]">Users</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-[#042C53]">Users</h1>
        {data && (
          <span className="rounded-full bg-[#E6F1FB] px-3 py-1 text-sm font-medium text-[#185FA5]">
            {data.length} total
          </span>
        )}
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[#888780]">
            <FiLoader className="animate-spin" size={16} />
            Loading users…
          </div>
        )}

        {isError && (
          <p className="rounded-xl border border-[#F4C7C7] bg-[#FCE8E8] px-5 py-4 text-sm text-[#A32D2D]">
            Could not load users. Make sure the backend is running and you are signed in as admin.
          </p>
        )}

        {data && data.length === 0 && (
          <p className="text-sm text-[#888780]">No users found.</p>
        )}

        {data && data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-[#D3D1C7]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#185FA5] text-left text-white">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-t border-[#D3D1C7] ${i % 2 === 1 ? "bg-[#F1EFE8]" : "bg-white"}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#2C2C2A]">
                      {user.name ?? <span className="text-[#888780]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[#55534e]">
                      {user.phone ?? <span className="text-[#888780]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[#55534e]">
                      {user.email ?? <span className="text-[#888780]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#888780]">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
