"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

type SchoolStatus = "pending" | "approved" | "rejected";

type AdminSchool = {
  id: string;
  name: string;
  slug: string;
  status: SchoolStatus;
  isFeatured: boolean;
  createdAt: string;
  city: { name: string };
  board: { name: string };
  details: { phone: string | null; email: string | null } | null;
};

type Tab = "all" | SchoolStatus;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_TONE: Record<SchoolStatus, "amber" | "success" | "danger"> = {
  pending: "amber",
  approved: "success",
  rejected: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminSchoolsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  // Auth gate
  useEffect(() => {
    const token = getAuthToken();
    if (!token) { router.replace("/auth/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
      if (payload.role !== "admin") router.replace("/");
    } catch { router.replace("/auth/login"); }
  }, [router]);

  const { data: schools, isLoading, isError } = useQuery({
    queryKey: ["admin-schools"],
    queryFn: async (): Promise<AdminSchool[]> => {
      const res = await fetch(`${API_URL}/api/admin/schools`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load schools");
      const json = (await res.json()) as { data: AdminSchool[] };
      return json.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/admin/schools/${id}/approve`, {
        method: "PUT",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to approve school");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-schools"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`${API_URL}/api/admin/schools/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to reject school");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-schools"] }),
  });

  function handleReject(school: AdminSchool) {
    const reason = window.prompt(`Reject ${school.name}? Optional reason:`);
    if (reason === null) return;
    rejectMutation.mutate({ id: school.id, reason });
  }

  const filtered = useMemo(() => {
    if (!schools) return [];
    return activeTab === "all" ? schools : schools.filter((s) => s.status === activeTab);
  }, [schools, activeTab]);

  const counts = useMemo(() => {
    const base: Record<Tab, number> = { all: 0, pending: 0, approved: 0, rejected: 0 };
    if (!schools) return base;
    base.all = schools.length;
    for (const s of schools) base[s.status]++;
    return base;
  }, [schools]);

  return (
    <div className="container-shell py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[#888780]">
        <Link href="/admin" className="hover:text-[#185FA5]">Admin</Link>
        <span>›</span>
        <span className="font-medium text-[#2C2C2A]">Schools</span>
      </nav>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-heading text-3xl font-bold text-[#042C53]">Manage Schools</h1>
        <Button asChild variant="amber">
          <Link href="/admin/schools/add">
            <Plus size={16} />
            Add School
          </Link>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-[#D3D1C7]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative -mb-px flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-b-2 border-[#185FA5] text-[#185FA5]"
                : "text-[#55534e] hover:text-[#185FA5]"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id ? "bg-[#E6F1FB] text-[#185FA5]" : "bg-[#F1EFE8] text-[#888780]"
              }`}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="mt-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[#888780]">
            <Loader2 className="animate-spin" size={16} />
            Loading schools…
          </div>
        )}

        {isError && (
          <p className="rounded-xl border border-[#F4C7C7] bg-[#FCE8E8] px-5 py-4 text-sm text-[#A32D2D]">
            Could not load schools. Make sure the backend is running and you are signed in as admin.
          </p>
        )}

        {schools && filtered.length === 0 && (
          <p className="rounded-xl border border-[#D3D1C7] bg-white px-5 py-8 text-center text-sm text-[#888780]">
            No schools in this tab.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-[#D3D1C7]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#185FA5] text-left text-white">
                  <th className="px-4 py-3 font-semibold">School</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Board</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((school, i) => {
                  const isApproving = approveMutation.isPending && approveMutation.variables === school.id;
                  const isRejecting =
                    rejectMutation.isPending && rejectMutation.variables?.id === school.id;
                  const isPending = school.status === "pending";

                  return (
                    <tr
                      key={school.id}
                      className={`border-t border-[#D3D1C7] ${i % 2 === 1 ? "bg-[#F1EFE8]" : "bg-white"}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/schools/${school.slug}`}
                          target="_blank"
                          className="font-semibold text-[#0C447C] hover:text-[#185FA5] hover:underline"
                        >
                          {school.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#55534e]">{school.city.name}</td>
                      <td className="px-4 py-3 text-[#55534e]">{school.board.name}</td>
                      <td className="px-4 py-3 text-[#55534e]">
                        {school.details?.phone ?? <span className="text-[#888780]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[school.status]} className="capitalize">
                          {school.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[#888780]">{formatDate(school.createdAt)}</td>
                      <td className="px-4 py-3">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => approveMutation.mutate(school.id)}
                              disabled={isApproving || isRejecting}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#3B6D11] bg-[#EAF3DE] px-3 py-1.5 text-xs font-semibold text-[#3B6D11] transition hover:bg-[#d4ebbb] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isApproving ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />}
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(school)}
                              disabled={isApproving || isRejecting}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#A32D2D] bg-[#FCE8E8] px-3 py-1.5 text-xs font-semibold text-[#A32D2D] transition hover:bg-[#f8d4d4] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isRejecting ? <Loader2 className="animate-spin" size={13} /> : <X size={13} />}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="block text-right text-xs text-[#888780]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(approveMutation.isError || rejectMutation.isError) && (
          <p className="mt-4 rounded-lg bg-[#FCE8E8] px-4 py-3 text-sm font-medium text-[#A32D2D]">
            {approveMutation.error?.message || rejectMutation.error?.message}
          </p>
        )}
      </div>
    </div>
  );
}
