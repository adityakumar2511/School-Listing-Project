import { Suspense } from "react";
import { SchoolsListingClient } from "./schools-listing-client";

function ListingShellSkeleton() {
  return (
    <div className="container-shell py-10">
      <div className="mb-7">
        <div className="h-11 w-56 animate-pulse rounded-[8px] bg-[#D3D1C7]" />
        <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-[8px] bg-[#D3D1C7]" />
      </div>
      <div className="h-20 animate-pulse rounded-[12px] border border-[#D3D1C7] bg-white" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-[12px] border border-[#D3D1C7] bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function SchoolsPage() {
  return (
    <Suspense fallback={<ListingShellSkeleton />}>
      <SchoolsListingClient />
    </Suspense>
  );
}
