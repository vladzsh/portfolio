# Portfolio — vladzsh.org

Personal portfolio and blog for Vladyslav Zhuravel.

## Stack

- **Framework**: Next.js 15 (App Router, static export)
- **Styling**: Tailwind CSS v4 + CSS custom properties
- **Language**: TypeScript
- **Blog**: Markdown files parsed at build time (gray-matter + remark/rehype)
- **Font**: Quantico (Google Fonts via next/font)
- **Deploy**: Static export (`output: "export"` in next.config.ts)

## Project structure

```
app/                  # Next.js pages
  layout.tsx          # Root layout (font, theme init, nav, footer)
  page.tsx            # Home — hero, experience, projects, skills, about, contact
  globals.css         # Tailwind imports + custom CSS (dot pattern, animations, theme vars)
  blog/
    page.tsx          # Blog listing
    [slug]/page.tsx   # Individual post (from markdown)
components/           # React components
  Nav.tsx             # Sticky nav, hamburger, scroll effects (client)
  Hero.tsx            # Hero section
  TypedText.tsx       # Typed animation effect (client)
  Experience.tsx      # Timeline
  Projects.tsx        # Project list
  Skills.tsx          # Skills grid (2 cols desktop, 1 mobile)
  About.tsx           # About section
  Contact.tsx         # Contact cards with SVG icons
  Footer.tsx          # Footer
  ThemeToggle.tsx     # Dark/light toggle (client)
  DotAccent.tsx       # Cursor spotlight on dot grid (client)
  ScrollReveal.tsx    # Intersection observer animations (client)
lib/
  data.ts             # Projects, experience, skills arrays
  blog.ts             # Markdown parser — getAllPosts(), getPostBySlug(), getAllSlugs()
content/blog/         # Blog posts as .md files with frontmatter
public/img/           # Static assets (logos, og image)
```

## Commands

```bash
npm run dev           # Dev server on localhost:3000
npm run build         # Production build + static export to out/
npm run start         # Serve production build
```

## Conventions

- **Theme**: dark/light via `data-theme="dark"` on `<html>`. Default is dark. Stored in localStorage.
- **CSS variables**: defined in `app/globals.css` under `@theme` and `:root` / `[data-theme="dark"]`. Used in components as `var(--color-text-primary)` etc.
- **Client vs Server**: only use `"use client"` when browser APIs are needed (DOM, IntersectionObserver, localStorage, event listeners). Data components stay server.
- **Blog posts**: frontmatter must have `title`, `date` (YYYY-MM-DD), `excerpt`. Body is standard markdown. Raw HTML is supported.
- **Static export**: site is fully static (`output: "export"`). No server-side features (no API routes, no middleware). Blog pages generated via `generateStaticParams`.
- **Responsive**: mobile breakpoint is 768px. Nav collapses to hamburger, grids go single-column, padding reduces.
- **Projects without URL**: rendered as `<div>` instead of `<a>`, no arrow on hover, no hover background.

## Adding a blog post

Create `content/blog/<slug>.md`:

```markdown
---
title: "Post Title"
date: "2026-04-01"
excerpt: "Short description for the listing page."
---

Markdown content. Supports **bold**, *italic*, headings, lists, `code`, blockquotes, images, and raw HTML.
```

Rebuild to generate the static page.
