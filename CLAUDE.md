# Portfolio — vladzsh.org

Personal portfolio and blog for Vladyslav Zhuravel.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + CSS custom properties in `:root`
- **Language**: TypeScript
- **Blog**: Markdown files parsed at build time (gray-matter + remark/rehype)
- **CV**: Auto-generated PDF via @react-pdf/renderer (`scripts/generate-cv.tsx`)
- **Font**: Quantico (Google Fonts via next/font)
- **Deploy**: Vercel (native Next.js, no static export)

## Project structure

```
app/                  # Next.js pages
  layout.tsx          # Root layout (font, theme init, nav, footer)
  page.tsx            # Home — hero, experience, projects, skills, about, contact
  globals.css         # Tailwind imports + custom CSS (dot pattern, animations, theme vars)
  blog/
    page.tsx          # Blog listing
    [slug]/page.tsx   # Individual post (from markdown)
  cv/
    page.tsx          # CV viewer with embedded PDF iframe + download button
components/           # React components
  Nav.tsx             # Sticky nav, hamburger (920px breakpoint), scroll effects (client)
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
  data.ts             # Projects, experience, skills, education, cvSkills arrays
  blog.ts             # Markdown parser — getAllPosts(), getPostBySlug(), getAllSlugs()
content/blog/         # Blog posts as .md files with frontmatter
scripts/
  generate-cv.tsx     # React-PDF template + build script → public/cv.pdf
public/
  img/                # Static assets (logos, og image)
  fonts/              # Quantico .ttf for CV generation
  cv.pdf              # Auto-generated CV (do not edit manually)
```

## Commands

```bash
npm run dev           # Dev server on localhost:3000
npm run build         # Generate CV + production build
npm run generate:cv   # Regenerate CV PDF only
```

## Conventions

- **Theme**: dark/light via `data-theme="dark"` on `<html>`. Default is dark. Stored in localStorage.
- **CSS variables**: defined in `app/globals.css` under `:root` and `[data-theme="dark"]`. Do NOT use `@theme` for colors — Tailwind v4 compiles `@theme` tokens statically, so runtime dark mode override won't work. Only `--font-quantico` goes in `@theme`.
- **CSS var colors in JSX**: use `style={{ color: 'var(--color-text-primary)' }}` for reliable rendering. Tailwind arbitrary values like `text-[var(--color-x)]` can be ambiguous (color vs font-size).
- **Nav styles**: mobile menu styles live in `globals.css` as `.nav-menu` / `.nav-link` classes, not inline Tailwind. Keep it that way for readability.
- **Client vs Server**: only use `"use client"` when browser APIs are needed (DOM, IntersectionObserver, localStorage, event listeners). Data components stay server.
- **Blog posts**: frontmatter must have `title`, `date` (YYYY-MM-DD), `excerpt`. Body is standard markdown. Raw HTML is supported.
- **Responsive**: mobile/hamburger breakpoint is 920px. Nav collapses to hamburger with slide-down animation.
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

Run `npm run build` to generate the page.

## Updating the CV

Edit data in `lib/data.ts` (experience, projects, skills, education, cvSkills), then run `npm run generate:cv`. The CV is also regenerated automatically on every `npm run build`.
