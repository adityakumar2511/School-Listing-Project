"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SchoolCard } from "@/components/schools/school-card";
import { SearchPanel } from "@/components/schools/search-panel";
import { Button } from "@/components/ui/button";
import type { School } from "@/data/schools";
import { fetchSchoolsList } from "@/lib/schools-api";

type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

type SchoolsResponse = {
  data: School[];
  pagination: ApiPagination;
};

type SchoolFilters = {
  q?: string;
  city?: string;
  board?: string;
  facility?: string;
  page: number;
  limit: number;
};

const DEFAULT_LIMIT = 6;

async function fetchSchools(filters: SchoolFilters): Promise<SchoolsResponse> {
  return fetchSchoolsList({
    q: filters.q,
    city: filters.city,
    board: filters.board,
    facility: filters.facility,
    page: filters.page,
    limit: filters.limit
  });
}

function SchoolsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[12px] border border-[#D3D1C7] bg-white">
          <div className="aspect-[16/9] animate-pulse bg-[#D3D1C7]" />
          <div className="grid gap-4 p-5">
            <div className="h-5 w-28 animate-pulse rounded bg-[#D3D1C7]" />
            <div className="h-7 w-4/5 animate-pulse rounded bg-[#D3D1C7]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#D3D1C7]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#D3D1C7]" />
            <div className="h-11 w-full animate-pulse rounded-[8px] bg-[#D3D1C7]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SchoolsListingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? 1);
  const filters: SchoolFilters = {
    q: searchParams.get("q") || undefined,
    city: searchParams.get("city") || undefined,
    board: searchParams.get("board") || undefined,
    facility: searchParams.get("facility") || undefined,
    page: Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1,
    limit: DEFAULT_LIMIT
  };

  const query = useQuery({
    queryKey: ["schools", filters],
    queryFn: () => fetchSchools(filters),
    placeholderData: keepPreviousData
  });

  const response = query.data;
  const schools = response?.data ?? [];
  const pagination = response?.pagination ?? {
    page: filters.page,
    limit: filters.limit,
    total: 0,
    totalPages: 1
  };
  const totalPages = pagination.totalPages ?? Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const hasPrevious = pagination.page > 1;
  const hasNext = pagination.page < totalPages;

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/schools?${params.toString()}`);
  }

  return (
    <div className="container-shell py-10">
      <div className="mb-7">
        <h1 className="font-heading text-4xl font-bold text-[#042C53]">Find schools</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#55534e]">
          Search by school name, city, or board. Filter results and move through pages without losing your shortlist.
        </p>
      </div>

      <SearchPanel showFacility={false} />

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#2C2C2A]">
              {query.isLoading ? "Searching schools..." : `${pagination.total} schools found`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#55534e]">
            <span>
              Page {pagination.page} of {totalPages}
            </span>
          </div>
        </div>

        {query.isLoading ? <SchoolsSkeleton /> : null}

        {!query.isLoading && schools.length === 0 ? (
          <div className="grid min-h-80 place-items-center rounded-[12px] border border-[#D3D1C7] bg-white p-8 text-center">
            <div>
              <SearchX className="mx-auto text-[#185FA5]" size={42} />
              <h2 className="mt-4 font-heading text-2xl font-bold text-[#0C447C]">No schools found</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#55534e]">
                Try a different city, board, or search term. New school listings are added regularly.
              </p>
            </div>
          </div>
        ) : null}

        {!query.isLoading && schools.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {schools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#D3D1C7] pt-5">
              <Button variant="outline" onClick={() => setPage(pagination.page - 1)} disabled={!hasPrevious || query.isFetching}>
                <ChevronLeft size={17} />
                Previous
              </Button>
              <span className="text-sm font-medium text-[#55534e]">
                {pagination.page} / {totalPages}
              </span>
              <Button variant="outline" onClick={() => setPage(pagination.page + 1)} disabled={!hasNext || query.isFetching}>
                Next
                <ChevronRight size={17} />
              </Button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
