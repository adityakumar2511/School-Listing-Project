import type { Metadata } from "next";
import Link from "next/link";
import { fetchCities } from "@/lib/schools-api";

export const revalidate = 3600;

type StatePageProps = {
  params: Promise<{ state: string }>;
};

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state } = await params;
  const label = state.replaceAll("-", " ");
  return {
    title: `Schools in ${label} | SchoolSetu`,
    description: `Explore cities and schools in ${label}.`
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params;
  const label = state.replaceAll("-", " ");
  const cities = await fetchCities();

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">Schools in {label}</h1>
      <p className="mt-3 text-sm text-[#55534e]">Choose a city to browse approved school listings.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <Link
            key={city.id}
            href={`/schools/${city.slug}`}
            className="rounded-xl border border-[#D3D1C7] bg-white p-5 font-semibold hover:border-[#85B7EB]"
          >
            {city.name}
            <span className="mt-2 block text-xs font-normal text-[#55534e]">
              {city._count?.schools ?? 0} schools
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
