"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function handleSearch() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(`/schools/prayagraj${qs ? `?${qs}` : ""}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#D3D1C7] bg-white p-3 shadow-sm">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by school name or board..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#888780]"
      />
      <span className="shrink-0 rounded-lg bg-[#E6F1FB] px-3 py-2 text-sm font-medium text-[#185FA5]">
        📍 Prayagraj
      </span>
      <Button
        onClick={handleSearch}
        className="shrink-0 bg-[#185FA5] text-white hover:bg-[#0C447C]"
      >
        Search Schools
      </Button>
    </div>
  );
}
