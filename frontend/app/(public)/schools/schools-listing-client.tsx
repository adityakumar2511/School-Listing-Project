"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  filterSchools,
  BOARDS,
  type Board,
  type FeeRange,
  type Gender,
  type SpecialFocus,
  type SchoolFacilities,
} from "@/data/schools";
import { normalizeSchool } from "@/lib/schools-api";
import { SchoolCard } from "@/components/schools/school-card";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "relevance" | "fee-asc" | "fee-desc" | "newest";

type Props = {
  defaultCitySlug?: string;
};

// ─── Static filter config ─────────────────────────────────────────────────────

const genderOptions: { label: string; value: Gender | "" }[] = [
  { label: "All", value: "" },
  { label: "Co-Educational", value: "Co-Educational" },
  { label: "Boys", value: "Boys" },
  { label: "Girls", value: "Girls" },
];

const feeRangeOptions: { label: string; value: FeeRange }[] = [
  { label: "Budget", value: "budget" },
  { label: "Mid-Range", value: "mid-range" },
  { label: "Premium", value: "premium" },
];

const facilityOptions: { label: string; key: keyof SchoolFacilities }[] = [
  { label: "Hostel", key: "hostel" },
  { label: "Transport", key: "transport" },
  { label: "Library", key: "library" },
  { label: "Labs", key: "labs" },
  { label: "Smart Classroom", key: "smartClassroom" },
];

const focusOptions: SpecialFocus[] = ["IIT/NEET", "Sports", "Scholarship"];

// ─── Component ────────────────────────────────────────────────────────────────

export function SchoolsListingClient({ defaultCitySlug = "prayagraj" }: Props) {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedFeeRange, setSelectedFeeRange] = useState<FeeRange | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<(keyof SchoolFacilities)[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<SpecialFocus | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("relevance");

  // Sync URL search params → local state on first mount
  useEffect(() => {
    const q = searchParams.get("q");
    const board = searchParams.get("board");
    const gender = searchParams.get("gender");
    const feeRange = searchParams.get("feeRange");

    if (q) setSearchQuery(q);
    if (board && (BOARDS as readonly string[]).includes(board))
      setSelectedBoard(board as Board);
    if (gender) setSelectedGender(gender as Gender);
    if (feeRange) setSelectedFeeRange(feeRange as FeeRange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFacility(key: keyof SchoolFacilities) {
    setSelectedFacilities((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedBoard(null);
    setSelectedGender(null);
    setSelectedFeeRange(null);
    setSelectedFacilities([]);
    setSelectedFocus(null);
    setSortBy("relevance");
  }

  const filtered = useMemo(() => {
    const raw = filterSchools({
      citySlug: defaultCitySlug,
      board: selectedBoard ?? undefined,
      gender: selectedGender ?? undefined,
      feeRange: selectedFeeRange ?? undefined,
      facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
      specialFocus: selectedFocus ?? undefined,
      q: searchQuery || undefined,
    }).map(normalizeSchool);

    switch (sortBy) {
      case "fee-asc":
        return [...raw].sort((a, b) => a.monthlyFee - b.monthlyFee);
      case "fee-desc":
        return [...raw].sort((a, b) => b.monthlyFee - a.monthlyFee);
      case "newest":
        return [...raw].sort((a, b) => Number(b.id) - Number(a.id));
      default:
        return raw;
    }
  }, [
    defaultCitySlug,
    selectedBoard,
    selectedGender,
    selectedFeeRange,
    selectedFacilities,
    selectedFocus,
    sortBy,
    searchQuery,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 flex-shrink-0 md:block">
        <div className="sticky top-4 space-y-6 rounded-xl border border-[#D3D1C7] bg-white p-5">
          {/* Search */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Search
            </p>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="School name or area..."
              className="w-full rounded-lg border border-[#D3D1C7] px-3 py-2 text-sm outline-none focus:border-[#185FA5]"
            />
          </div>

          {/* Board */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Board
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedBoard(null)}
                className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  selectedBoard === null
                    ? "bg-[#185FA5] text-white"
                    : "border border-[#D3D1C7] hover:border-[#185FA5]"
                }`}
              >
                All Boards
              </button>
              {BOARDS.map((board) => (
                <button
                  key={board}
                  onClick={() => setSelectedBoard(board)}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    selectedBoard === board
                      ? "bg-[#185FA5] text-white"
                      : "border border-[#D3D1C7] hover:border-[#185FA5]"
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Type
            </p>
            <div className="flex flex-col gap-1.5">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedGender(opt.value ? opt.value : null)}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    (opt.value === "" && selectedGender === null) ||
                    selectedGender === opt.value
                      ? "bg-[#185FA5] text-white"
                      : "border border-[#D3D1C7] hover:border-[#185FA5]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Range */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Fee Range
            </p>
            <div className="space-y-2">
              {feeRangeOptions.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFeeRange === opt.value}
                    onChange={() =>
                      setSelectedFeeRange((prev) => (prev === opt.value ? null : opt.value))
                    }
                    className="accent-[#185FA5]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Facilities
            </p>
            <div className="space-y-2">
              {facilityOptions.map((opt) => (
                <label key={opt.key} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(opt.key)}
                    onChange={() => toggleFacility(opt.key)}
                    className="accent-[#185FA5]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Special Focus */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Special Focus
            </p>
            <div className="space-y-2">
              {focusOptions.map((focus) => (
                <label key={focus} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFocus === focus}
                    onChange={() =>
                      setSelectedFocus((prev) => (prev === focus ? null : focus))
                    }
                    className="accent-[#185FA5]"
                  />
                  {focus}
                </label>
              ))}
            </div>
          </div>

          <Button variant="ghost" className="w-full text-sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="min-w-0 flex-1">
        {/* Results header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-[#2C2C2A]">
            <span className="text-[#185FA5]">{filtered.length}</span> schools found in Prayagraj
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-[#D3D1C7] px-3 py-2 text-sm outline-none focus:border-[#185FA5]"
          >
            <option value="relevance">Relevance</option>
            <option value="fee-asc">Fee: Low to High</option>
            <option value="fee-desc">Fee: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* School cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filtered.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#D3D1C7] bg-white py-16 text-center">
            <span className="text-5xl">🔍</span>
            <h3 className="mt-4 font-heading text-xl font-bold text-[#0C447C]">
              No Schools Found
            </h3>
            <p className="mt-2 text-sm text-[#888780]">
              Try changing your filters or clearing the search
            </p>
            <Button variant="ghost" className="mt-4" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
