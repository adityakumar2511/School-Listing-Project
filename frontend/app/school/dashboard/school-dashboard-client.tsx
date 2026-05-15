"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
