---
title: Migrating from Eleventy + Vite to Astro
date: 2026-01-01
layout: ../../layouts/BlogPost.astro
---

After running a dual-build system with Eleventy handling static pages and Vite bundling React components, I decided to migrate to Astro. Here's why and how it went.

## The Problem with Dual Builds

My previous setup required:
- Running two separate dev servers
- Coordinating build sequences
- Managing file ignores to prevent build conflicts
- Constant rebuilds during development

It worked, but the developer experience was frustrating.

## Why Astro?

Astro's Islands architecture provides the best of both worlds:
- **Static-first**: Most content is plain HTML with zero JavaScript
- **Partial hydration**: React components load only where needed
- **Unified build**: Single dev server, single build command
- **Better DX**: Hot module reload actually works

## The Migration Process

The migration took about 90 minutes and involved:

1. **Converting templates**: Nunjucks `.njk` files → Astro `.astro` files
2. **React components**: Zero changes needed (they just work!)
3. **Styling**: Moved to global imports in the base layout
4. **Build config**: Replaced dual configs with single `astro.config.mjs`

The React components didn't need any modifications. Astro's React integration handles everything seamlessly.

## Results

**Before:**
```bash
bun run build:vite && bun run build:eleventy
# Two separate dev servers
# Manual coordination required
```

**After:**
```bash
bun dev
# Single unified dev server
# Hot reload just works
```

## Lessons Learned

1. **Start simple**: Astro's file-based routing is intuitive
2. **Islands are powerful**: Hydrate only what needs interactivity
3. **TypeScript works great**: Built-in support with excellent DX
4. **Migration is smooth**: Astro plays well with existing React code

If you're running a hybrid static + React setup, Astro is worth considering. The improved developer experience alone makes it worthwhile.
