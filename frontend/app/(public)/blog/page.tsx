import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { fetchPublishedBlogPosts } from "@/lib/blog-api";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "School Admission Guides — Prayagraj 2025 | SchoolSetu",
  description:
    "School admission guides, board comparisons, and hostel school reviews for parents in Prayagraj.",
  openGraph: {
    title: "School Admission Guides — Prayagraj 2025 | SchoolSetu",
    description:
      "School admission guides, board comparisons, and hostel school reviews for parents in Prayagraj.",
    url: "https://schoolsetu.in/blog",
    type: "website",
  },
};

type TagColor = "blue" | "amber" | "success";

function excerptFromPost(content: string, seoDescription: string | null, max = 180) {
  const base = (seoDescription ?? content).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return base.length > max ? `${base.slice(0, max)}…` : base;
}

function readTimeFromContent(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

function tagForPost(slug: string): { tag: string; tagColor: TagColor } {
  if (slug.includes("admission")) return { tag: "Admission Guide", tagColor: "blue" };
  if (slug.includes("board") || slug.includes("cbse")) return { tag: "Board Comparison", tagColor: "amber" };
  if (slug.includes("hostel")) return { tag: "School Reviews", tagColor: "success" };
  return { tag: "Guide", tagColor: "blue" };
}

const tagBg: Record<TagColor, string> = {
  blue: "bg-[#E6F1FB]",
  amber: "bg-[#FAEEDA]",
  success: "bg-[#EAF3DE]",
};

export default async function BlogPage() {
  const rows = await fetchPublishedBlogPosts();
  const featured = rows[0];
  const rest = rows.slice(1);

  return (
    <div className="container-shell py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-[#042C53]">School Guides &amp; Admission Tips</h1>
        <p className="mt-3 text-lg text-[#55534e]">Helpful articles for parents in Prayagraj</p>
      </div>

      {featured ? (
        (() => {
          const meta = tagForPost(featured.slug);
          const published =
            featured.publishedAt &&
            new Date(featured.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          return (
            <Link href={`/blog/${featured.slug}`} className="group mb-8 block">
              <div
                className={`relative overflow-hidden rounded-2xl border border-[#D3D1C7] ${tagBg[meta.tagColor]} p-8 transition-shadow hover:shadow-md`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={meta.tagColor}>{meta.tag}</Badge>
                  <span className="text-xs text-[#888780]">
                    {readTimeFromContent(featured.content)} read
                    {published ? ` · ${published}` : ""}
                  </span>
                </div>
                <h2 className="mt-4 font-heading text-2xl font-bold leading-snug text-[#042C53] group-hover:text-[#185FA5] md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#55534e]">
                  {excerptFromPost(featured.content, featured.seoDescription)}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5]">
                  Read More →
                </span>
              </div>
            </Link>
          );
        })()
      ) : (
        <p className="text-[#55534e]">No published articles yet. Please check back soon.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {rest.map((post) => {
          const meta = tagForPost(post.slug);
          const published =
            post.publishedAt &&
            new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="h-full rounded-2xl border border-[#D3D1C7] bg-white p-6 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={meta.tagColor}>{meta.tag}</Badge>
                  <span className="text-xs text-[#888780]">
                    {readTimeFromContent(post.content)} read
                    {published ? ` · ${published}` : ""}
                  </span>
                </div>
                <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-[#042C53] group-hover:text-[#185FA5]">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#55534e]">
                  {excerptFromPost(post.content, post.seoDescription)}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5]">
                  Read More →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-14 rounded-2xl border border-[#D3D1C7] bg-[#F1EFE8] px-8 py-8 text-center">
        <p className="font-heading text-xl font-bold text-[#042C53]">Want to Compare Schools Directly?</p>
        <p className="mt-2 text-[#55534e]">
          Browse the best CBSE, ICSE, and UP Board schools in Prayagraj — all in one place
        </p>
        <Link
          href="/schools/prayagraj"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#185FA5] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0C447C]"
        >
          Browse Schools →
        </Link>
      </div>
    </div>
  );
}
