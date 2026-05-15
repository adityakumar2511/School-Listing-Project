import { schools, type School } from "@/data/schools";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type SchoolFilters = {
  q?: string;
  city?: string;
  board?: string;
  facility?: string;
  category?: string;
};

export async function getSchools(filters: SchoolFilters = {}): Promise<School[]> {
  if (API_URL && typeof window !== "undefined") {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetch(`${API_URL}/api/schools?${params.toString()}`);
    if (response.ok) {
      const payload = await response.json();
      return payload.data;
    }
  }

  return schools.filter((school) => {
    const query = filters.q?.toLowerCase();
    const matchesQuery =
      !query ||
      school.name.toLowerCase().includes(query) ||
      school.city.toLowerCase().includes(query) ||
      school.description.toLowerCase().includes(query);
    const matchesCity = !filters.city || school.citySlug === filters.city;
    const matchesBoard = !filters.board || school.board.toLowerCase().replace(" ", "_") === filters.board;
    const matchesFacility = !filters.facility || school.facilities.some((item) => item.toLowerCase().replaceAll(" ", "-") === filters.facility);
    const matchesCategory = !filters.category || school.categories.includes(filters.category);
    return matchesQuery && matchesCity && matchesBoard && matchesFacility && matchesCategory;
  });
}

export function getSchoolBySlug(slug: string) {
  return schools.find((school) => school.slug === slug);
}

export function getSchoolsByCity(citySlug: string) {
  return schools.filter((school) => school.citySlug === citySlug);
}
