import type { Metadata } from "next";
import { SchoolCard } from "@/components/schools/school-card";
import { fetchSchoolsList } from "@/lib/schools-api";

export const revalidate = 3600;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

const categoryTitles: Record<string, string> = {
  "iit-neet": "IIT / NEET Schools",
  sports: "Sports Schools",
  hostel: "Hostel Schools",
  girls: "Girls Schools"
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const title = categoryTitles[category] ?? "Schools";
  return {
    title: `${title} | SchoolSetu`,
    description: `Discover ${title.toLowerCase()} with verified profiles on SchoolSetu.`
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const title = categoryTitles[category] ?? "Schools";
  const { data: results } = await fetchSchoolsList({ category, limit: 24 }).catch(() => ({
    data: [],
    pagination: { page: 1, limit: 24, total: 0, totalPages: 0 }
  }));

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">{title}</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {results.map((school) => (
          <SchoolCard key={school.id} school={school} />
        ))}
      </div>
      {results.length === 0 ? <p className="mt-8 text-sm text-[#55534e]">No schools found in this category.</p> : null}
    </div>
  );
}
