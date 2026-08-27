import { desc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { blogPosts } from "@psikosanal/db/schema";
import type { createBlogPostSchema } from "../validation/blog";
import type { z } from "zod";
import { blogPostNotFound, blogSlugTaken } from "./errors";

export async function listPublishedPosts() {
  return db.query.blogPosts.findMany({
    where: eq(blogPosts.published, true),
    orderBy: [desc(blogPosts.publishedAt)],
  });
}

export async function getPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, slug) });
}

export async function listAllPostsForAdmin() {
  return db.query.blogPosts.findMany({ orderBy: [desc(blogPosts.createdAt)] });
}

export async function getPostById(id: number) {
  const post = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
  if (!post) throw blogPostNotFound();
  return post;
}

export async function createPost(input: z.infer<typeof createBlogPostSchema>) {
  try {
    const [created] = await db
      .insert(blogPosts)
      .values({ ...input, coverImageUrl: input.coverImageUrl || null })
      .returning();
    return created;
  } catch {
    throw blogSlugTaken();
  }
}

export async function updatePost(id: number, input: z.infer<typeof createBlogPostSchema>) {
  const [updated] = await db
    .update(blogPosts)
    .set({ ...input, coverImageUrl: input.coverImageUrl || null, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning();
  if (!updated) throw blogPostNotFound();
  return updated;
}

export async function togglePublished(id: number, published: boolean) {
  await db
    .update(blogPosts)
    .set({ published, publishedAt: published ? new Date() : null })
    .where(eq(blogPosts.id, id));
}

export async function deletePost(id: number) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
