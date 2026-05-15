import type { Metadata } from "next";
import { SchoolCard } from "@/components/schools/school-card";
import { fetchSchoolsList } from "@/lib/schools-api";

type BoardPageProps = {
  params: Promise<{ board: string }>;
};

export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  const { board } = await params;
  const label = board.replaceAll("_", " ");
  return {
    title: `${label.toUpperCase()} Schools | SchoolSetu`,
    description: `Browse ${label} schools with fees, facilities, and admission status on SchoolSetu.`
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { board } = await params;
  const { data: results } = await fetchSchoolsList({ board, limit: 24 }).catch(() => ({ data: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } }));
  const label = board.replaceAll("_", " ");

  return (
    <div className="container-shell py-10">
      <h1 className="font-heading text-4xl font-bold text-[#042C53]">{label.toUpperCase()} schools</h1>
      <p className="mt-3 text-sm text-[#55534e]">Compare fees, facilities, and admission options for {label} schools.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {results.map((school) => (
          <SchoolCard key={school.id} school={school} />
        ))}
      </div>
      {results.length === 0 ? <p className="mt-8 text-sm text-[#55534e]">No schools found for this board.</p> : null}
    </div>
  );
}
