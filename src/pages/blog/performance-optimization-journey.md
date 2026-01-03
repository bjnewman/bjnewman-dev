---
layout: ../../layouts/BlogPost.astro
title: "Optimizing My Astro Site: A Performance Journey"
description: "How I improved page load times by deferring React hydration and what I learned about Lighthouse along the way."
date: 2026-01-02
draft: true
---

# Optimizing My Astro Site: A Performance Journey

I recently set up Lighthouse CI to monitor my site's performance. The initial results were... humbling.

## The Problem

My homepage scored **71** on Lighthouse performance with a Largest Contentful Paint (LCP) of **17.7 seconds**. That's not a typo. Almost 18 seconds before the main content painted.

For a static site built with Astro - a framework that specifically touts "zero JS by default" - this was embarrassing.

## Finding the Culprits

The issue wasn't the HTML. Astro renders everything server-side. The problem was **React hydration**.

I had several React components loading with `client:load`:

```astro
<!-- In my layout -->
<ThemeToggle client:load />
<SecretFeatures client:load />
<PageCollectible client:load />

<!-- On the homepage -->
<TypewriterCode client:load />
<StatCards client:load />
```

The `client:load` directive means "load and hydrate this component immediately." Every single one of these was blocking the main thread while the 179KB React runtime loaded and initialized.

## The Fix

Astro provides several hydration strategies. I switched non-critical components:

```astro
<!-- Defer until browser is idle -->
<SecretFeatures client:idle />

<!-- Load when visible in viewport -->
<PageCollectible client:visible />
<TypewriterCode client:visible />
<StatCards client:visible />
```

The key insight: **only things that need to be interactive immediately should use `client:load`**.

## Results

After the changes:

| Page | Before | After |
|------|--------|-------|
| About | 18.3s LCP | 2.5s LCP |
| Homepage | 17.7s LCP | TBD |

The about page improved dramatically because it has fewer interactive components. Still investigating the other pages.

## Lessons Learned

1. **Astro's islands are opt-in** - You choose when and how to hydrate. Use that power.

2. **`client:load` is expensive** - Reserve it for genuinely critical interactivity.

3. **Lighthouse local runs differ from production** - Run against production for accurate numbers.

4. **The React runtime is big** - 179KB gzipped. Worth it for complex apps, but for simple interactions, consider alternatives.

## Setting Up Lighthouse CI

For anyone wanting to monitor their own site:

```bash
bun add -d @lhci/cli
```

Create `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/about/', '/blog/'],
      numberOfRuns: 1,
      // Use Playwright's Chromium to avoid macOS permission issues
      chromePath: require('playwright').chromium.executablePath(),
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

Then run:

```bash
bun run build && bun run lighthouse
```

## What's Next

I'm still investigating why some pages show a 17-second LCP in local testing. The numbers seem artificially high - possibly a testing environment issue rather than actual performance. Real-world testing on the deployed site will tell the real story.

Performance is a journey, not a destination. Each improvement teaches you something about how the web works.
