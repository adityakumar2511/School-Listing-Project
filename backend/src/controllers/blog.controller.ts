import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { z } from "zod";

function slugifyBlog(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function allocateSlug(seedTitle: string) {
  let seed = slugifyBlog(seedTitle);
  if (!seed) seed = "post";
  let n = 0;
  while (true) {
    const candidate = n === 0 ? seed : `${seed}-${n}`;
    const clash = await prisma.blogPost.findUnique({ where: { slug: candidate } });
    if (!clash) return candidate;
    n += 1;
  }
}

const publishedWhere = () =>
  ({
    publishedAt: { not: null, lte: new Date() }
  }) as const;

/** GET /api/admin/blog — public; published posts only */
export const listPublicBlogPosts = asyncHandler(async (_req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: publishedWhere(),
    orderBy: { publishedAt: "desc" },
  });
  res.json({ data: posts });
});

/** GET /api/admin/blog/:slug — public single post */
export const getPublicBlogPostBySlug = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug ?? "");
  const post = await prisma.blogPost.findFirst({
    where: { slug, ...publishedWhere() },
  });
  if (!post) throw new HttpError(404, "Blog post not found");
  res.json({ data: post });
});

const createBlogSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().min(1),
  author: z.string().trim().min(1),
  slug: z.string().trim().optional(),
  seo_title: z.string().trim().optional(),
  seo_description: z.string().trim().optional(),
  published_at: z.union([z.string(), z.null()]).optional(),
});

const updateBlogSchema = z.object({
  title: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  content: z.string().optional(),
  author: z.string().trim().optional(),
  seo_title: z.union([z.string().trim(), z.null()]).optional(),
  seo_description: z.union([z.string().trim(), z.null()]).optional(),
  published_at: z.union([z.string(), z.null()]).optional(),
});

/** POST /api/admin/blog — admin */
export const createBlogPostAdmin = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const body = createBlogSchema.parse(req.body);

  let slug: string;
  if (body.slug?.trim()) {
    slug = slugifyBlog(body.slug);
    const clash = await prisma.blogPost.findUnique({ where: { slug } });
    if (clash) throw new HttpError(409, "Slug already in use");
  } else {
    slug = await allocateSlug(body.title);
  }

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug,
      content: body.content,
      author: body.author,
      seoTitle: body.seo_title ?? null,
      seoDescription: body.seo_description ?? null,
      publishedAt: body.published_at ? new Date(body.published_at) : null,
    },
  });

  res.status(201).json({ data: post });
});

/** PUT /api/admin/blog/:id — admin */
export const updateBlogPostAdmin = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const id = String(req.params.id);
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Blog post not found");

  const body = updateBlogSchema.parse(req.body);

  let slug = existing.slug;

  let nextTitle = existing.title;
  if (typeof body.title === "string" && body.title.trim() !== "") {
    nextTitle = body.title.trim();
  }

  if (typeof body.slug === "string" && body.slug.trim() !== "") {
    const nextSlug = slugifyBlog(body.slug);
    if (nextSlug !== existing.slug) {
      const clash = await prisma.blogPost.findUnique({ where: { slug: nextSlug } });
      if (clash && clash.id !== id) throw new HttpError(409, "Slug already in use");
      slug = nextSlug;
    }
  }

  if (!body.slug && typeof body.title === "string" && body.title.trim() !== "" && nextTitle !== existing.title) {
    slug = await allocateSlug(nextTitle);
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
      slug,
      ...(typeof body.content === "string" ? { content: body.content } : {}),
      ...(typeof body.author === "string" ? { author: body.author.trim() } : {}),
      ...(body.seo_title !== undefined
        ? { seoTitle: body.seo_title === null ? null : body.seo_title }
        : {}),
      ...(body.seo_description !== undefined
        ? { seoDescription: body.seo_description === null ? null : body.seo_description }
        : {}),
      ...(body.published_at !== undefined
        ? { publishedAt: body.published_at ? new Date(body.published_at) : null }
        : {}),
    },
  });

  res.json({ data: post });
});

/** DELETE /api/admin/blog/:id — admin */
export const deleteBlogPostAdmin = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const id = String(req.params.id);
  const existed = await prisma.blogPost.findUnique({ where: { id } });
  if (!existed) throw new HttpError(404, "Blog post not found");
  await prisma.blogPost.delete({ where: { id } });
  res.json({ message: "Deleted", id });
});
