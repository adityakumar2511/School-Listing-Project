import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from "@/lib/blog-api";

export const revalidate = 3600;

type SlugProps = { params: Promise<{ slug: string }> };

type TagColor = "blue" | "amber" | "success";

function tagForPost(slug: string): { tag: string; tagColor: TagColor } {
  if (slug.includes("admission")) return { tag: "Admission Guide", tagColor: "blue" };
  if (slug.includes("board") || slug.includes("cbse")) return { tag: "Board Comparison", tagColor: "amber" };
  if (slug.includes("hostel")) return { tag: "School Reviews", tagColor: "success" };
  return { tag: "Guide", tagColor: "blue" };
}

function readTimeFromContent(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

export async function generateStaticParams() {
  const posts = await fetchPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  const desc = post.seoDescription ?? "";
  return {
    title: post.seoTitle ? `${post.seoTitle} | SchoolSetu` : `${post.title} | SchoolSetu`,
    description: desc || post.title,
    openGraph: {
      title: post.title,
      description: desc || post.title,
      url: `https://schoolsetu.in/blog/${slug}`,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: SlugProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) notFound();

  const meta = tagForPost(post.slug);
  const published =
    post.publishedAt &&
    new Date(post.publishedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="container-shell py-12">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#888780]">
        <Link href="/" className="hover:text-[#185FA5]">
          Home
        </Link>
        <span>›</span>
        <Link href="/blog" className="hover:text-[#185FA5]">
          Blog
        </Link>
        <span>›</span>
        <span className="text-[#2C2C2A]">{post.title}</span>
      </nav>

      <div className="mx-auto max-w-[720px]">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge tone={meta.tagColor}>{meta.tag}</Badge>
          <span className="text-sm text-[#888780]">
            {readTimeFromContent(post.content)} read
            {published ? ` · ${published}` : ""}
            {post.author ? ` · ${post.author}` : ""}
          </span>
        </div>

        <h1 className="font-heading text-[36px] font-bold leading-tight text-[#042C53]">{post.title}</h1>

        {post.seoDescription ? (
          <p className="mt-4 text-lg leading-relaxed text-[#55534e]">{post.seoDescription}</p>
        ) : null}

        <div className="my-8 border-t border-[#D3D1C7]" />

        <div
          className="max-w-none text-base leading-[1.8] text-[#55534e] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-heading [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:text-[#185FA5] [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-14 flex flex-wrap gap-4 border-t border-[#D3D1C7] pt-8">
          <Link href="/blog" className="text-sm font-semibold text-[#185FA5] hover:underline">
            ← More Guides
          </Link>
          <Link href="/schools/prayagraj" className="text-sm font-semibold text-[#185FA5] hover:underline">
            View Prayagraj Schools →
          </Link>
        </div>
      </div>
    </div>
  );
}
