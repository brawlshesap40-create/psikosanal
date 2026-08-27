import { notFound } from "next/navigation";
import { getPostById } from "@/lib/blog/queries";
import { updateBlogPostAction } from "@/lib/blog/actions";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { DomainError } from "@psikosanal/core";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post;
  try {
    post = await getPostById(Number(id));
  } catch (error) {
    if (error instanceof DomainError) notFound();
    throw error;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Yazıyı Düzenle</h1>
      <div className="mt-6 max-w-2xl">
        <BlogPostForm action={updateBlogPostAction.bind(null, post.id)} defaultValues={post} />
      </div>
    </div>
  );
}
