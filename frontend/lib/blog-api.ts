import { API_URL } from "./schools-api";

export type BlogPostApi = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function fetchPublishedBlogPosts(): Promise<BlogPostApi[]> {
  const response = await fetch(`${API_URL}/api/admin/blog`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as { data?: BlogPostApi[] };
  return payload.data ?? [];
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPostApi | null> {
  const response = await fetch(`${API_URL}/api/admin/blog/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
  if (response.status === 404) return null;
  if (!response.ok) return null;
  const payload = (await response.json()) as { data?: BlogPostApi };
  return payload.data ?? null;
}
