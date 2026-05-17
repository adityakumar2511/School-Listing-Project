"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheck, FiLoader, FiX } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

type PendingItem = {
  id: string;
  schoolId: string;
  fieldType: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown>;
  reviewedAt: string | null;
  school: { name: string };
  submitter: { id: string; name: string | null; phone: string | null; email: string | null };
};

function previewValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 0);
  return String(value);
}

export default function AdminModerationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-moderation"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/moderation`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load moderation queue");
      const json = (await res.json()) as { data: PendingItem[] };
      return json.data;
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/admin/moderation/${id}/approve`, {
        method: "PUT",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Approve failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-moderation"] }),
  });

  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`${API_URL}/api/admin/moderation/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Reject failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-moderation"] }),
  });

  function handleReject(item: PendingItem) {
    const reason = window.prompt(`Reject update for ${item.school.name}? Optional reason:`);
    if (reason === null) return;
    reject.mutate({ id: item.id, reason });
  }

  return (
    <div className="container-shell py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[#888780]">
        <Link href="/admin" className="hover:text-[#185FA5]">
          Admin
        </Link>
        <span>›</span>
        <span className="font-medium text-[#2C2C2A]">Moderation</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-[#042C53]">Pending Profile Updates</h1>
      <p className="mt-1 text-sm text-[#888780]">
        Review and approve profile changes submitted by school admins.
      </p>

      <div className="mt-8 space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[#888780]">
            <FiLoader className="animate-spin" size={16} />
            Loading queue…
          </div>
        )}

        {isError && (
          <p className="rounded-xl border border-[#F4C7C7] bg-[#FCE8E8] px-5 py-4 text-sm text-[#A32D2D]">
            Could not load moderation queue.
          </p>
        )}

        {data && data.length === 0 && (
          <p className="rounded-xl border border-[#D3D1C7] bg-white px-5 py-8 text-center text-sm text-[#888780]">
            No pending updates. Everything is reviewed.
          </p>
        )}

        {data?.map((item) => {
          const isApproving = approve.isPending && approve.variables === item.id;
          const isRejecting = reject.isPending && reject.variables?.id === item.id;
          const keys = Object.keys(item.newValue ?? {});

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#D3D1C7] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#0C447C]">
                    {item.school.name}
                  </h2>
                  <p className="text-xs text-[#888780]">
                    Submitted by {item.submitter.name ?? item.submitter.phone ?? item.submitter.email ?? "—"}
                  </p>
                </div>
                <Badge tone="amber" className="capitalize">
                  {item.fieldType}
                </Badge>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-[#D3D1C7]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F1EFE8] text-left text-xs uppercase text-[#55534e]">
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Current</th>
                      <th className="px-3 py-2">Proposed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key} className="border-t border-[#D3D1C7]">
                        <td className="px-3 py-2 font-medium text-[#2C2C2A]">{key}</td>
                        <td className="px-3 py-2 text-[#888780]">
                          {previewValue(item.oldValue?.[key])}
                        </td>
                        <td className="px-3 py-2 text-[#2C2C2A]">
                          {previewValue(item.newValue[key])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => approve.mutate(item.id)}
                  disabled={isApproving || isRejecting}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#3B6D11] bg-[#EAF3DE] px-3 py-1.5 text-xs font-semibold text-[#3B6D11] transition hover:bg-[#d4ebbb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApproving ? <FiLoader className="animate-spin" size={13} /> : <FiCheck size={13} />}
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(item)}
                  disabled={isApproving || isRejecting}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#A32D2D] bg-[#FCE8E8] px-3 py-1.5 text-xs font-semibold text-[#A32D2D] transition hover:bg-[#f8d4d4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRejecting ? <FiLoader className="animate-spin" size={13} /> : <FiX size={13} />}
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
