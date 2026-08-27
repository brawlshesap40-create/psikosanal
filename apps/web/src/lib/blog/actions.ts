"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { createBlogPostSchema } from "@/lib/validation/blog";
import { blogService, DomainError } from "@psikosanal/core";

export type BlogFormState = { error?: string } | undefined;

function parseBlogForm(formData: FormData) {
  return createBlogPostSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || undefined,
    authorName: String(formData.get("authorName") ?? "").trim(),
  });
}

export async function createBlogPostAction(
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await verifyAdminSession();

  const parsed = parseBlogForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  try {
    await blogService.createPost(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function updateBlogPostAction(
  id: number,
  _prevState: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await verifyAdminSession();

  const parsed = parseBlogForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  try {
    await blogService.updatePost(id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
}

export async function togglePublishedAction(id: number, published: boolean) {
  await verifyAdminSession();
  await blogService.togglePublished(id, published);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPostAction(id: number) {
  await verifyAdminSession();
  await blogService.deletePost(id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
