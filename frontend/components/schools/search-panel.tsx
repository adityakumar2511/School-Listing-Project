"use client";

import { FiSearch } from "react-icons/fi";
import { MdTune } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BOARDS, TARGET_CITIES, facilities } from "@/data/schools";

type SearchPanelProps = {
  showFacility?: boolean;
};

export function SearchPanel({ showFacility = true }: SearchPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [board, setBoard] = useState(searchParams.get("board") ?? "");
  const [facility, setFacility] = useState(searchParams.get("facility") ?? "");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (board) params.set("board", board);
    if (showFacility && facility) params.set("facility", facility);
    const queryString = params.toString();
    router.push(queryString ? `/schools?${queryString}` : "/schools");
  }

  return (
    <form
      onSubmit={submit}
      className={`grid gap-3 rounded-[12px] border border-[#D3D1C7] bg-white p-4 shadow-sm ${
        showFacility ? "md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" : "md:grid-cols-[1.4fr_1fr_1fr_auto]"
      }`}
    >
      <label className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888780]" size={18} />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search school, city, board"
          className="h-12 w-full rounded-[8px] border border-[#D3D1C7] pl-10 pr-3 outline-none focus:border-[#185FA5]"
        />
      </label>
      <select value={city} onChange={(event) => setCity(event.target.value)} className="h-12 rounded-[8px] border border-[#D3D1C7] px-3 outline-none focus:border-[#185FA5]">
        <option value="">All cities</option>
        {TARGET_CITIES.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <select value={board} onChange={(event) => setBoard(event.target.value)} className="h-12 rounded-[8px] border border-[#D3D1C7] px-3 outline-none focus:border-[#185FA5]">
        <option value="">All boards</option>
        {BOARDS.map((item) => (
          <option key={item} value={item.toLowerCase().replace(" ", "_")}>
            {item}
          </option>
        ))}
      </select>
      {showFacility ? (
        <select value={facility} onChange={(event) => setFacility(event.target.value)} className="h-12 rounded-[8px] border border-[#D3D1C7] px-3 outline-none focus:border-[#185FA5]">
          <option value="">Any facility</option>
          {facilities.map((item) => (
            <option key={item} value={item.toLowerCase().replaceAll(" ", "-")}>
              {item}
            </option>
          ))}
        </select>
      ) : null}
      <Button type="submit" variant="amber" size="lg">
        <MdTune size={17} />
        Find
      </Button>
    </form>
  );
}
