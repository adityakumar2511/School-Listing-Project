"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiStar } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

type InquiryRecord = {
  id: string;
  status: string;
  studentName: string;
  classApplying: string;
  createdAt: string;
  parent?: { name?: string; phone?: string };
};

const statusOptions = ["new", "contacted", "interested", "converted", "closed"] as const;

export function SchoolDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [schoolId, setSchoolId] = useState("");
  const [noteModalId, setNoteModalId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string; schoolId?: string };
    if (payload.role && payload.role !== "school" && payload.role !== "admin") {
      router.replace("/auth/login");
    }
    if (payload.schoolId) setSchoolId(payload.schoolId);
  }, [router]);

  const mySchoolQuery = useQuery({
    queryKey: ["my-school"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/schools/me`, { headers: authHeaders() });
      if (response.status === 404) return null;
      if (!response.ok) return null;
      const payload = (await response.json()) as { data: { id: string; name: string; status: string } };
      return payload.data;
    },
  });

  const inquiriesQuery = useQuery({
    queryKey: ["school-inquiries", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const response = await fetch(`${API_URL}/api/schools/${schoolId}/inquiries`, { headers: authHeaders() });
      if (!response.ok) throw new Error("Could not load inquiries");
      const payload = (await response.json()) as { data: InquiryRecord[] };
      return payload.data;
    },
    enabled: Boolean(schoolId)
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${API_URL}/api/inquiries/${id}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Status update failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school-inquiries", schoolId] })
  });

  const noteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const response = await fetch(`${API_URL}/api/inquiries/${id}/notes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ note })
      });
      if (!response.ok) throw new Error("Could not save note");
    },
    onSuccess: () => {
      setNoteModalId(null);
      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["school-inquiries", schoolId] });
    }
  });

  const inquiries = inquiriesQuery.data ?? [];
  const newThisWeek = inquiries.filter((item) => {
    const created = new Date(item.createdAt).getTime();
    return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">School dashboard</h1>
      {!schoolId ? (
        <p className="mt-4 text-sm text-[#55534e]">
          Link your school phone to this account to view inquiries. Contact support if you need help.
        </p>
      ) : null}

      {/* Pending school status warning */}
      {mySchoolQuery.data?.status === "pending" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#EF9F27] bg-[#FAEEDA] px-5 py-4">
          <span className="mt-0.5 text-lg">⏳</span>
          <div>
            <p className="font-semibold text-[#633806]">Your school is under review.</p>
            <p className="mt-0.5 text-sm text-[#55534e]">
              It will appear on the website once approved by our team. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="font-semibold">Total inquiries</p>
          <p className="mt-2 text-3xl font-bold text-[#185FA5]">{inquiries.length}</p>
        </Card>
        <Card>
          <p className="font-semibold">New this week</p>
          <p className="mt-2 text-3xl font-bold text-[#185FA5]">{newThisWeek}</p>
        </Card>
        <Card>
          <p className="font-semibold">Profile views</p>
          <p className="mt-2 text-3xl font-bold text-[#185FA5]">128</p>
        </Card>
      </div>

      {/* Featured Listing upgrade card — PAYMENTS_DISABLED */}
      {/* TODO: re-enable when Razorpay is configured */}
      <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#D3D1C7] bg-[#FAEEDA] p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EF9F27]/20">
          <FiStar size={20} color="#EF9F27" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading font-bold text-[#633806]">Get Featured Placement</p>
            {/* TODO: re-enable when Razorpay is configured */}
            <Badge tone="neutral">Coming soon</Badge>
          </div>
          <p className="mt-1 text-sm text-[#55534e]">
            Appear at the top of search results and receive 3× more inquiries. ₹999 / month.
          </p>
        </div>
        {/* TODO: re-enable when Razorpay is configured */}
        <Button
          variant="amber"
          size="sm"
          disabled
          className="flex-shrink-0 cursor-not-allowed opacity-50"
        >
          Upgrade
        </Button>
      </div>

      <section className="mt-10 overflow-x-auto">
        <h2 className="font-heading text-2xl font-bold text-[#0C447C]">Inquiries</h2>
        <table className="mt-4 w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#E6F1FB] text-left">
              <th className="p-3">Parent</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Student</th>
              <th className="p-3">Class</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-t border-[#D3D1C7]">
                <td className="p-3">{inquiry.parent?.name ?? "Parent"}</td>
                <td className="p-3">{inquiry.parent?.phone ?? "—"}</td>
                <td className="p-3">{inquiry.studentName}</td>
                <td className="p-3">{inquiry.classApplying}</td>
                <td className="p-3">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <select
                    value={inquiry.status}
                    onChange={(event) => statusMutation.mutate({ id: inquiry.id, status: event.target.value })}
                    className="rounded-lg border border-[#D3D1C7] px-2 py-1"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <Button variant="outline" size="sm" onClick={() => setNoteModalId(inquiry.id)}>
                    Add note
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {noteModalId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h3 className="font-heading text-lg font-bold text-[#0C447C]">Add note</h3>
            <textarea
              rows={4}
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              className="mt-3 w-full rounded-lg border border-[#D3D1C7] px-3 py-2"
            />
            <div className="mt-4 flex gap-2">
              <Button variant="amber" onClick={() => noteMutation.mutate({ id: noteModalId, note: noteText })}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setNoteModalId(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
