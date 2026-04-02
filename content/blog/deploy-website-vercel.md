---
title: "From Zero to Production in 15 Minutes: Deploying a Website With Vercel"
date: "2026-04-02"
excerpt: "Buy a domain, connect GitHub, deploy a static site or Next.js app — and never think about servers again. Here's the full walkthrough."
---

## Why Vercel

You have a site. Maybe it's a static HTML page, maybe a Next.js app, maybe a portfolio built over the weekend. You want it live on the internet, on your own domain, with HTTPS, and you don't want to manage a server.

Vercel does exactly this. Free tier covers most personal projects. No Docker, no Nginx configs, no SSH. Push code — site is live.

I deployed my portfolio (vladzsh.org) this way. The whole process — from buying the domain to seeing the site live — took about 15 minutes.

## What Vercel Handles Well

**Static sites** — plain HTML/CSS/JS, Hugo, Jekyll, Astro. Vercel serves them from a global CDN. Fast everywhere.

**Next.js** — Vercel built Next.js, so the integration is seamless. Server components, API routes, ISR, middleware — everything works out of the box. If you're using `output: "export"` for a fully static build, it's even simpler.

**Any frontend framework** — React, Vue, Svelte, Nuxt. Vercel auto-detects the framework and applies the right build settings.

## Step 1: Buy a Domain

Go to any registrar — Namecheap, Cloudflare, Google Domains (now Squarespace), or even Vercel's own domain service. Pick a `.com`, `.dev`, `.org`, whatever fits.

I use Namecheap. A `.org` domain costs about $10/year.

You don't need to configure DNS yet — Vercel will tell you exactly what to set.

## Step 2: Push Your Code to GitHub

If your project isn't on GitHub yet:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin git@github.com:yourusername/your-repo.git
git push -u origin main
```

That's it. Vercel will pull from this repo.

## Step 3: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your repository
4. Vercel auto-detects the framework (Next.js, static, etc.)
5. Click **Deploy**

First deploy happens automatically. Your site is now live at `your-project.vercel.app`.

## Step 4: Connect Your Domain

In the Vercel dashboard:

1. Go to your project → **Settings** → **Domains**
2. Type your domain (e.g. `vladzsh.org`) and click **Add**
3. Vercel shows you the DNS records to add

Go to your registrar's DNS settings and add:

```
Type: A
Name: @
Value: 76.76.21.21
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait a few minutes for DNS propagation. Vercel automatically provisions an SSL certificate — HTTPS works immediately.

## Step 5: Deploy

From now on, you have two ways to deploy:

### Option A: Git Push (recommended)

```bash
git add .
git commit -m "update homepage"
git push
```

Every push to `main` triggers an automatic deploy. Vercel builds your project, runs the build command, and updates the live site. You also get preview deployments for every branch and PR — each one gets its own URL.

### Option B: Vercel CLI

Install the CLI:

```bash
npm i -g vercel
```

Deploy to production with one command:

```bash
vercel --prod
```

This is useful when you want to deploy without pushing to Git, or when you're testing something quickly. The CLI also supports `vercel dev` for local development that mirrors the production environment.

## My Setup

For my portfolio (vladzsh.org), the setup is:

- **Framework:** Next.js 15 with `output: "export"` (fully static)
- **Hosting:** Vercel free tier
- **Domain:** Namecheap → DNS pointed to Vercel
- **Deploy:** `git push` to main → auto-deploy in ~30 seconds
- **SSL:** Automatic, zero configuration

The `next.config.js` for a static export:

```js
const nextConfig = {
  output: "export",
};

module.exports = nextConfig;
```

That's it. No server needed. Vercel builds the static files and serves them from the edge.

## What You Get for Free

- **Global CDN** — your site loads fast everywhere
- **Automatic HTTPS** — SSL certificates provisioned and renewed automatically
- **Preview deployments** — every PR gets its own URL for testing
- **Instant rollbacks** — one click to revert to any previous deployment
- **Analytics** (basic) — page views, web vitals
- **100 GB bandwidth/month** — more than enough for a personal site
- **Serverless functions** — if you need API routes later

## When Not to Use Vercel

Vercel is great for frontend and static sites. It's not the right choice for:

- **Backend services** — Django, FastAPI, Express. Use Railway, Fly.io, or a VPS
- **Databases** — Vercel has Postgres and KV storage, but for serious workloads, use a dedicated provider
- **Long-running processes** — serverless functions have execution time limits

For a portfolio, blog, or frontend app — Vercel is the fastest path from code to production.

## The Whole Process

```
1. Buy domain           → 2 minutes
2. Push code to GitHub  → 1 minute (if code exists)
3. Connect Vercel       → 3 minutes
4. Add domain + DNS     → 5 minutes
5. Wait for propagation → 15 min to 24 hours
───────────────────────────────
Total: ~15 minutes
```

After setup, every deploy is one `git push`. That's the whole workflow.
