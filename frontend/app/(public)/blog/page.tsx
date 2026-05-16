import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

const blogPosts: {
  slug: string;
  title: string;
  description: string;
  tag: string;
  tagColor: TagColor;
  readTime: string;
  publishedAt: string;
  featured: boolean;
}[] = [
  {
    slug: "prayagraj-school-admission-guide-2025",
    title: "School Admission in Prayagraj 2025 — Complete Guide",
    description:
      "Documents, timeline, and fees — everything first-time applicants need to know",
    tag: "Admission Guide",
    tagColor: "blue",
    readTime: "5 min",
    publishedAt: "January 15, 2025",
    featured: true,
  },
  {
    slug: "cbse-vs-up-board-prayagraj",
    title: "CBSE vs UP Board — An Honest Comparison for Prayagraj Parents",
    description:
      "Curriculum, exam pattern, and college admissions — a detailed comparison of both boards to help you decide",
    tag: "Board Comparison",
    tagColor: "amber",
    readTime: "4 min",
    publishedAt: "January 20, 2025",
    featured: false,
  },
  {
    slug: "top-hostel-schools-prayagraj",
    title: "Top Hostel Schools in Prayagraj — Fees and Facilities 2025",
    description:
      "Safe, affordable, and academically strong boarding schools — with detailed fees and facilities",
    tag: "School Reviews",
    tagColor: "success",
    readTime: "6 min",
    publishedAt: "February 1, 2025",
    featured: false,
  },
];

const tagBg: Record<TagColor, string> = {
  blue: "bg-[#E6F1FB]",
  amber: "bg-[#FAEEDA]",
  success: "bg-[#EAF3DE]",
};

export default function BlogPage() {
  const featured = blogPosts.find((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <div className="container-shell py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-[#042C53]">
          School Guides &amp; Admission Tips
        </h1>
        <p className="mt-3 text-lg text-[#55534e]">
          Helpful articles for parents in Prayagraj
        </p>
      </div>

      {/* Featured post */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group mb-8 block">
          <div
            className={`relative overflow-hidden rounded-2xl border border-[#D3D1C7] ${tagBg[featured.tagColor]} p-8 transition-shadow hover:shadow-md`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={featured.tagColor}>{featured.tag}</Badge>
              <span className="text-xs text-[#888780]">
                {featured.readTime} read · {featured.publishedAt}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold leading-snug text-[#042C53] group-hover:text-[#185FA5] md:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#55534e]">
              {featured.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5]">
              Read More →
            </span>
          </div>
        </Link>
      )}

      {/* Regular posts grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {rest.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <div className="h-full rounded-2xl border border-[#D3D1C7] bg-white p-6 transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={post.tagColor}>{post.tag}</Badge>
                <span className="text-xs text-[#888780]">
                  {post.readTime} read · {post.publishedAt}
                </span>
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-[#042C53] group-hover:text-[#185FA5]">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#55534e]">{post.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5]">
                Read More →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 rounded-2xl border border-[#D3D1C7] bg-[#F1EFE8] px-8 py-8 text-center">
        <p className="font-heading text-xl font-bold text-[#042C53]">
          Want to Compare Schools Directly?
        </p>
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
