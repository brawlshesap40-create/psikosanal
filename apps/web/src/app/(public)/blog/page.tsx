import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function BlogListPage() {
  const posts = await listPublishedPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Blog</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ruh sağlığı, online terapi ve ilişkiler üzerine yazılar.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz yayınlanmış bir yazı yok.</p>
        )}
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="card-interactive">
              <CardContent className="flex flex-col gap-1.5">
                <h2 className="font-medium text-foreground">{post.title}</h2>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">
                  {post.authorName}
                  {post.publishedAt &&
                    ` · ${post.publishedAt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
