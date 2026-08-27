import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getPostBySlug, listPublishedPosts } from "@/lib/blog/queries";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 180));

  const allPosts = await listPublishedPosts();
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Tüm Yazılar
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">{post.title}</h1>

      <div className="mt-3 flex items-center gap-2.5">
        <Avatar size="sm">
          <AvatarFallback>{post.authorName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">
          {post.authorName}
          {post.publishedAt &&
            ` · ${post.publishedAt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`}
          {" · "}
          {readingMinutes} dk okuma
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 text-[15px] leading-relaxed text-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-sm font-medium text-foreground">Diğer Yazılar</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`}>
                <Card className="h-full card-interactive">
                  <CardContent>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
