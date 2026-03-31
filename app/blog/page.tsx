import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Blog — Vladyslav Zhuravel",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="min-h-[calc(80vh-0px)] py-12 px-6 md:py-[72px] flex justify-center">
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
          Blog
        </h1>

        <ScrollReveal stagger>
          <div className="border-t border-[#5e6063]">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="stagger-item flex justify-between items-start py-4 px-1 border-b border-[#5e6063] transition-colors duration-800 hover:bg-white/[0.03] max-md:flex-col"
              >
                <div className="flex-1 max-w-[75%] max-md:max-w-full">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-0.5">
                    {post.title}
                  </h3>
                  <p className="text-base text-[var(--color-text-secondary)]">
                    {post.excerpt}
                  </p>
                </div>
                <span className="text-sm text-[var(--color-text-muted)] whitespace-nowrap ml-6 shrink-0 pt-1 max-md:ml-0 max-md:mt-1">
                  {post.date}
                </span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
