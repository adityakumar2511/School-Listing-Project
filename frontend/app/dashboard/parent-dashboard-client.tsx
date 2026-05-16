"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Loader2, LogOut, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, clearAuthToken, getAuthToken } from "@/lib/auth-token";
import { useCompareStore } from "@/store/compare-store";

type InquiryRecord = {
  id: string;
  status: "new" | "contacted" | "interested" | "converted" | "closed" | "admitted" | "rejected";
  studentName: string;
  classApplying: string;
  message?: string | null;
  createdAt: string;
  school: { id: string; name: string; slug: string; board?: { name: string } | null };
};

type JwtPayload = { id: string; role: string; phone?: string; name?: string };

const STATUS_TONE: Record<InquiryRecord["status"], "success" | "amber" | "blue" | "danger" | "neutral"> = {
  new: "blue",
  contacted: "amber",
  interested: "amber",
  converted: "success",
  admitted: "success",
  closed: "neutral",
  rejected: "danger",
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1] ?? "")) as JwtPayload;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ParentDashboardClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const [parentName, setParentName] = useState<string>("Parent");
  const [phone, setPhone] = useState<string>("");

  // Resolve a friendly display name from session or JWT
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/parent/login");
      return;
    }
    const payload = decodeJwt(token);
    const sessionName = session?.user?.name?.trim();
    if (sessionName) setParentName(sessionName);
    else setParentName("Parent");
    if (payload?.phone) setPhone(payload.phone);
  }, [session?.user?.name, router]);

  const inquiriesQuery = useQuery({
    queryKey: ["my-inquiries"],
    queryFn: async (): Promise<InquiryRecord[]> => {
      const res = await fetch(`${API_URL}/api/inquiries/my`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load inquiries");
      const json = (await res.json()) as { data: InquiryRecord[] };
      return json.data;
    },
    enabled: typeof window !== "undefined" && Boolean(getAuthToken()),
  });

  function handleLogout() {
    clearAuthToken();
    if (session) {
      void signOut({ callbackUrl: "/" });
    } else {
      router.push("/");
    }
  }

  const inquiries = inquiriesQuery.data ?? [];

  return (
    <div className="container-shell py-10">
      {/* Header: Welcome + Logout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#888780]">Welcome back,</p>
          <h1 className="font-heading text-3xl font-bold text-[#042C53] sm:text-4xl">
            {parentName}
          </h1>
          {phone && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#55534e]">
              <User size={14} className="text-[#888780]" />
              {formatPhone(phone)}
            </p>
          )}
        </div>
        <Button onClick={handleLogout} variant="outline" className="self-start">
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      {/* Stat strip */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F1FB] text-[#185FA5]">
            <Bookmark size={20} />
          </div>
          <div>
            <p className="text-xs text-[#888780]">Shortlisted</p>
            <p className="font-heading text-2xl font-bold text-[#0C447C]">{selectedIds.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAEEDA] text-[#EF9F27]">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-xs text-[#888780]">My Inquiries</p>
            <p className="font-heading text-2xl font-bold text-[#0C447C]">
              {inquiriesQuery.isLoading ? "…" : inquiries.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3DE] text-[#3B6D11]">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-[#888780]">Quick Actions</p>
            <Link href="/schools/prayagraj" className="text-sm font-semibold text-[#185FA5] hover:underline">
              Browse schools →
            </Link>
          </div>
        </Card>
      </div>

      {/* Shortlisted Schools */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-[#0C447C]">
            Shortlisted Schools
          </h2>
          {selectedIds.length > 0 && (
            <Link href="/compare" className="text-sm font-semibold text-[#185FA5] hover:underline">
              Compare →
            </Link>
          )}
        </div>

        {selectedIds.length === 0 ? (
          <Card className="mt-4 text-center">
            <Bookmark size={28} className="mx-auto text-[#D3D1C7]" />
            <p className="mt-3 font-semibold text-[#2C2C2A]">No shortlisted schools yet</p>
            <p className="mt-1 text-sm text-[#888780]">
              Add schools to your shortlist to compare them side-by-side.
            </p>
            <Button asChild className="mt-4">
              <Link href="/schools/prayagraj">Browse Schools</Link>
            </Button>
          </Card>
        ) : (
          <p className="mt-4 text-sm text-[#55534e]">
            You have <strong>{selectedIds.length}</strong> school{selectedIds.length === 1 ? "" : "s"} shortlisted.{" "}
            <Link href="/compare" className="font-semibold text-[#185FA5] hover:underline">
              View comparison →
            </Link>
          </p>
        )}
      </section>

      {/* My Inquiries */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-[#0C447C]">My Inquiries</h2>

        {inquiriesQuery.isLoading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#888780]">
            <Loader2 className="animate-spin" size={16} />
            Loading inquiries…
          </div>
        )}

        {inquiriesQuery.isError && (
          <p className="mt-4 rounded-xl border border-[#F4C7C7] bg-[#FCE8E8] px-5 py-4 text-sm text-[#A32D2D]">
            Could not load your inquiries. Please refresh and try again.
          </p>
        )}

        {!inquiriesQuery.isLoading && inquiries.length === 0 && !inquiriesQuery.isError && (
          <Card className="mt-4 text-center">
            <MessageSquare size={28} className="mx-auto text-[#D3D1C7]" />
            <p className="mt-3 font-semibold text-[#2C2C2A]">No inquiries yet</p>
            <p className="mt-1 text-sm text-[#888780]">
              Find a school and click &ldquo;Send Inquiry&rdquo; to start a conversation.
            </p>
          </Card>
        )}

        {inquiries.length > 0 && (
          <div className="mt-4 grid gap-3">
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/schools/${inquiry.school.slug}`}
                      className="font-heading font-bold text-[#0C447C] hover:text-[#185FA5] hover:underline"
                    >
                      {inquiry.school.name}
                    </Link>
                    {inquiry.school.board?.name && (
                      <Badge tone="blue">{inquiry.school.board.name}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#55534e]">
                    {inquiry.studentName} &middot; Class {inquiry.classApplying}
                  </p>
                  <p className="mt-0.5 text-xs text-[#888780]">
                    Sent on {formatDate(inquiry.createdAt)}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[inquiry.status] ?? "neutral"} className="capitalize">
                  {inquiry.status}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
