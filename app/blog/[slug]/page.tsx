import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import ScrollReveal from "@/components/ScrollReveal";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Post Not Found" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="min-h-[80vh] py-12 px-6 md:py-[72px] flex items-center justify-center">
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <Link
          href="/blog"
          className="text-base text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-8 inline-block"
        >
          &larr; Back to Blog
        </Link>

        <ScrollReveal>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">
            {post.title}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            {post.date}
          </p>
          <div
            className="post-body text-lg text-[var(--color-text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
