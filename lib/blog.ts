import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { cache } from "react";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string;
}

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

function getMarkdownFiles(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllPosts(): BlogMeta[] {
  const slugs = getMarkdownFiles();
  const posts = slugs.map((slug) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
    };
  });
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export const getPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const result = await processor.process(content);
      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        body: String(result),
      };
    } catch {
      return null;
    }
  }
);

export function getAllSlugs(): string[] {
  return getMarkdownFiles();
}
