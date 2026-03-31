# vladzsh.org

Personal portfolio and blog — [vladzsh.org](https://vladzsh.org)

Built with Next.js 15, Tailwind CSS v4, and TypeScript. Blog posts written in Markdown, parsed at build time.

## Quick start

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Build & deploy

```bash
npm run build
```

Static files are exported to `out/`. Deploy to any static hosting (Vercel, Cloudflare Pages, Nginx, etc.).

## Blog

Add a new post by creating a `.md` file in `content/blog/`:

```markdown
---
title: "Post Title"
date: "2026-04-01"
excerpt: "Short description."
---

Your content here.
```

Run `npm run build` to generate the page.

## Tech

- [Next.js 15](https://nextjs.org) — App Router, static export
- [Tailwind CSS v4](https://tailwindcss.com) — utility-first styling
- [TypeScript](https://www.typescriptlang.org)
- [gray-matter](https://github.com/jonschlinkert/gray-matter) + [remark](https://github.com/remarkjs/remark) — Markdown parsing

## License

All rights reserved.
