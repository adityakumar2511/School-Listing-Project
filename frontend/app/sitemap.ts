import type { MetadataRoute } from "next";
import type { BlogPostApi } from "@/lib/blog-api";
import { API_URL, type CityRecord, type NormalizedSchool } from "@/lib/schools-api";

const SITE = "https://schoolsetu.in";

type BoardRecord = { slug: string; _count?: { schools: number } };

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/schools`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/ai-recommend`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/compare`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/for-schools`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms-of-service`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const schoolsPayload = await fetchJson<{ data: NormalizedSchool[] }>("/api/schools?limit=1000&page=1");
  const citiesPayload = await fetchJson<{ data: CityRecord[] }>("/api/cities");
  const boardsPayload = await fetchJson<{ data: BoardRecord[] }>("/api/boards");
  const blogPayload = await fetchJson<{ data: BlogPostApi[] }>("/api/admin/blog");

  const schools = schoolsPayload?.data ?? [];
  const cities = citiesPayload?.data ?? [];
  const boards = boardsPayload?.data ?? [];
  const blogs = blogPayload?.data ?? [];

  const schoolUrls: MetadataRoute.Sitemap = schools.map((s) => ({
    url: `${SITE}/schools/${s.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE}/schools/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const boardUrls: MetadataRoute.Sitemap = boards
    .filter((b) => (b._count?.schools ?? 0) > 0)
    .map((b) => ({
      url: `${SITE}/schools/board/${b.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));

  const blogUrls: MetadataRoute.Sitemap = blogs.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [...staticEntries, ...schoolUrls, ...cityUrls, ...boardUrls, ...blogUrls];
}
