"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SearchPanel } from "@/components/schools/search-panel";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

type InquiryRecord = {
  id: string;
  status: string;
  studentName: string;
  classApplying: string;
  createdAt: string;
  school: { name: string; slug: string };
};

const SAVED_KEY = "schoolsetu_saved_schools";

export function ParentDashboardClient() {
  const router = useRouter();

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth/login");
    }
  }, [router]);

  const inquiriesQuery = useQuery({
    queryKey: ["parent-inquiries"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/inquiries`, { headers: authHeaders() });
      if (!response.ok) throw new Error("Could not load inquiries");
      const payload = (await response.json()) as { data: InquiryRecord[] };
      return payload.data;
    },
    enabled: Boolean(getAuthToken())
  });

  const savedCount =
    typeof window !== "undefined" ? (JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]") as unknown[]).length : 0;

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">Parent dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="font-semibold">Saved schools</p>
          <p className="mt-2 text-3xl font-bold text-[#185FA5]">{savedCount}</p>
        </Card>
        <Card>
          <p className="font-semibold">My inquiries</p>
          <p className="mt-2 text-3xl font-bold text-[#185FA5]">{inquiriesQuery.data?.length ?? 0}</p>
        </Card>
        <Card>
          <p className="font-semibold">Quick search</p>
          <div className="mt-3">
            <Suspense>
              <SearchPanel />
            </Suspense>
          </div>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-[#0C447C]">My inquiries</h2>
        {inquiriesQuery.isLoading ? <p className="mt-4 text-sm text-[#55534e]">Loading...</p> : null}
        <div className="mt-4 grid gap-3">
          {(inquiriesQuery.data ?? []).map((inquiry) => (
            <Card key={inquiry.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/schools/${inquiry.school.slug}`} className="font-semibold text-[#185FA5] hover:underline">
                  {inquiry.school.name}
                </Link>
                <p className="text-sm text-[#55534e]">
                  {inquiry.studentName} · Class {inquiry.classApplying}
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#E6F1FB] px-3 py-1 text-xs font-semibold capitalize text-[#185FA5]">
                {inquiry.status}
              </span>
            </Card>
          ))}
          {!inquiriesQuery.isLoading && (inquiriesQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-[#55534e]">No inquiries yet. Browse schools and send an admission inquiry.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
