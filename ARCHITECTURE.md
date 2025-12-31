# Architecture Documentation

## Overview

This site uses a hybrid Eleventy + React architecture where:
- **Eleventy** handles all static content, pages, and site structure
- **React** is used selectively for interactive components only

## Directory Structure

```
/content/              # Eleventy content (markdown, templates)
  /_includes/          # Nunjucks templates and layouts
    /layouts/
      base.njk         # Base HTML template with nav/footer
  /blog/               # Blog posts
    blog.json          # Directory data file for blog
    *.md               # Individual blog posts
  index.njk            # Homepage
  about.njk            # About page
  projects.njk         # Projects page
  resume.njk           # Resume page

/src/                  # React source code
  /components/         # Interactive React components
    ProjectFilter.tsx  # Example interactive component
  /styles/             # Global styles (copied to /public/styles/)
    theme.css          # CSS variables, global styles, nav/footer
    components.css     # React component-specific styles
  App.tsx              # React component demo/container
  main.tsx             # React entry point

/public/               # Build output (gitignored)
  /app/                # Vite build of React app
    /assets/
      app.js           # React bundle
  /styles/             # Copied from src/styles
  *.html               # Eleventy-generated pages
```

## Build Process

### Development

- `bun dev` - Develop React components in isolation with Vite HMR
- `bun run dev:eleventy` - Develop Eleventy site with live reload

### Production

- `bun run build` - Runs both builds in sequence:
  1. `bun run build:vite` - Vite builds React app → `public/app/`
  2. `bun run build:eleventy` - Eleventy builds static site → `public/`

**Why this order?**
- Vite outputs to `public/app/`
- Eleventy outputs to `public/` but ignores `public/app/` (via .eleventyignore)
- Running Vite first ensures React assets are in place before Eleventy references them

## How to Add an Interactive React Component

### Step 1: Create the Component

```typescript
// src/components/MyInteractive.tsx
import React, { useState } from 'react';

export const MyInteractive: React.FC = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  );
};
```

### Step 2: Register in App.tsx

```typescript
// src/App.tsx
import { MyInteractive } from './components/MyInteractive'
import './styles/theme.css'
import './styles/components.css'

function App() {
  return (
    <div>
      <MyInteractive />
    </div>
  )
}
```

### Step 3: Add Mount Point in Eleventy Template

```html
<!-- content/projects.njk -->
---
layout: layouts/base.njk
title: Projects
---

<h1>My Projects</h1>
<p>Filter projects interactively:</p>

<!-- React mount point -->
<div id="root"></div>
<script type="module" src="/app/assets/app.js"></script>
```

**Important:** Only add the React mount point on pages that need interactivity. Most pages should remain purely static for better performance and SEO.

## Styling

### Global Styles (theme.css)

Located at `/src/styles/theme.css`, defines:
- CSS variables for pastel color palette
- Font definitions (Nunito, Comic Neue)
- Global body styles
- Navigation and footer styles (used by Eleventy templates)

Copied to `/public/styles/theme.css` during build via Eleventy passthrough.

### Component Styles (components.css)

Located at `/src/styles/components.css`, defines:
- React-specific component styles (e.g., `.project-filter`)
- Interactive element styles (buttons, hover states)

Imported by React components via `import './styles/components.css'`.

## Technology Stack

- **Static Site Generator**: Eleventy 3.0
- **Interactive Components**: React 19.1
- **Build Tool**: Vite 7.1
- **Package Manager**: Bun
- **Templating**: Nunjucks (.njk)
- **Styling**: CSS with custom properties
- **TypeScript**: For React components

## Key Configuration Files

- [.eleventy.js](.eleventy.js) - Eleventy configuration
  - Input: `content/`
  - Output: `public/`
  - Passthrough copies for styles and assets

- [vite.config.ts](vite.config.ts) - Vite configuration
  - Builds to `public/app/`
  - Deterministic filenames for Eleventy integration

- [.eleventyignore](.eleventyignore) - Excludes from Eleventy processing
  - `src/` - React source code
  - `public/app/` - Vite build output
  - `node_modules/`, `.vscode/`

- [tsconfig.json](tsconfig.json) - TypeScript configuration
  - Strict mode enabled
  - Path aliases: `@/*` → `./src/*`

## Development Workflow

1. **Starting a new feature:**
   - If it's static content: Add/edit Eleventy templates in `/content/`
   - If it needs interactivity: Create React component in `/src/components/`

2. **Testing locally:**
   - Eleventy site: `bun run dev:eleventy` (http://localhost:8080)
   - React components: `bun dev` (http://localhost:5173)

3. **Building for production:**
   - `bun run build` - Creates production build in `/public/`
   - `bun run clean` - Removes build artifacts

## Architectural Decisions

### Why Eleventy-First?

- **Better SEO**: Static HTML is crawlable without JavaScript
- **Faster page loads**: No JavaScript required for content pages
- **Simpler maintenance**: Most pages don't need React complexity
- **Progressive enhancement**: Add interactivity only where needed

### When to Use React?

Use React components when you need:
- Real-time filtering or sorting (e.g., project gallery)
- Complex user interactions (e.g., interactive timeline)
- Client-side state management (e.g., form wizards)
- Dynamic data visualization

**Don't use React for:**
- Simple navigation
- Static content display
- Blog posts
- Basic forms (use native HTML)

## Future Enhancements

Possible additions to consider:
- Blog pagination (Eleventy collections)
- RSS feed generation (Eleventy plugin)
- SEO meta tags and Open Graph images
- Dark mode toggle
- Search functionality
- Analytics integration
- Deployment configuration (Netlify/Vercel)
