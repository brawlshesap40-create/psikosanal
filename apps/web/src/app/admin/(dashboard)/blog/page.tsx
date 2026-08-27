import { listAllPostsForAdmin } from "@/lib/blog/queries";
import { createBlogPostAction } from "@/lib/blog/actions";
import { Card, CardContent } from "@/components/ui/card";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { BlogListActions } from "@/components/admin/blog-list-actions";

export default async function AdminBlogPage() {
  const posts = await listAllPostsForAdmin();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Blog Yazıları</h1>

      <Card className="mt-6">
        <CardContent>
          <h2 className="mb-3 font-medium text-foreground">Yeni Yazı</h2>
          <BlogPostForm action={createBlogPostAction} />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz yazı eklenmedi.</p>
        )}
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="text-sm text-muted-foreground">
                  {post.published ? "Yayında" : "Taslak"} · /blog/{post.slug}
                </p>
              </div>
              <BlogListActions id={post.id} published={post.published} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
