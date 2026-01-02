# Ben Newman's Personal Website

A modern personal website built with Astro and React, featuring interactive components, theme switching, and secret easter eggs.

**Live Site:** [bjnewman.dev](https://bjnewman.dev) (deployed on Cloudflare Pages)

## Tech Stack

- **Framework**: [Astro 5](https://astro.build) - Static site generator with Islands architecture
- **UI Library**: [React 19](https://react.dev) - Interactive components with partial hydration
- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Testing**: [Vitest](https://vitest.dev) with browser mode + Playwright
- **Styling**: Modern CSS with custom properties and theme system
- **Deployment**: Cloudflare Pages with automatic GitHub integration

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run tests
bun test

# Run tests in watch mode
bun run test:watch
```

## Project Structure

```
/src/
  /components/        # React components
    ConfettiCannon.tsx
    MusicPlayer.tsx
    SecretMenu.tsx
    ThemeSwitcher.tsx
  /layouts/           # Astro layouts
    Base.astro        # Main layout with nav/footer
  /pages/             # File-based routing
    index.astro       # Homepage
    about.astro       # About page
    projects.astro    # Projects page
    resume.astro      # Resume page
    /blog/            # Blog section
      index.astro     # Blog index
      *.md            # Blog posts
  /styles/            # Global styles
    theme.css         # CSS variables and global styles
    components.css    # Component-specific styles
    secret-menu.css   # Secret menu styles
  /test/              # Test files
    setup.ts          # Vitest setup
    /components/      # Component tests
  SecretFeatures.tsx  # Orchestrates secret features

/public/
  /assets/            # Static assets
    elevator-music.mp3
```

## Features

### Core Website
- **Modern Design**: Professional gradient themes with refined typography
- **Responsive**: Mobile-first design with adaptive navigation
- **Fast**: Static-first with partial hydration for interactivity
- **SEO-Friendly**: Semantic HTML with proper meta tags

### Secret Features (Press Cmd+K or tap ✨)
- **Confetti Cannon**: Party mode with physics-based confetti animation
- **Music Player**: Elevator music with floating indicator
- **Theme Switcher**: 6 distinct color palettes (Professional, Sunset, Ocean, Forest, Dark Mode, Pastel Dream)
- **Progressive Disclosure**: Hidden until discovered, then remembered

### Blog
- File-based routing with markdown support
- Automatic sorting by date
- Frontmatter for metadata

## Development

### Architecture: Astro Islands

This project uses Astro's Islands architecture:
- Most content is static HTML for optimal performance
- React components are selectively hydrated with `client:load` directive
- Only interactive features load JavaScript

### Adding a New Page

Create a `.astro` file in `src/pages/`:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="My New Page">
  <h1>Hello World</h1>
  <p>This is a new page.</p>
</Base>
```

### Adding a React Component

1. Create component in `src/components/MyComponent.tsx`
2. Import and use in an Astro page or layout:

```astro
---
import MyComponent from '../components/MyComponent';
---
<MyComponent client:load />
```

### Theme System

Themes use CSS custom properties for dynamic styling:
- Defined in `src/components/ThemeSwitcher.tsx`
- 6 pre-built themes with complete color palettes
- Persisted to localStorage
- Dynamic updates via `document.documentElement.style.setProperty()`

## Testing

Browser mode testing with Vitest and Playwright:

```bash
# Run all tests
bun test

# Watch mode
bun run test:watch

# UI mode
bun run test:ui
```

Tests are located in `src/test/components/` and use React Testing Library.

## Deployment

Automatically deployed to Cloudflare Pages on push to `main`:
- Build command: `bun run build`
- Output directory: `dist`
- Framework preset: Astro

## Scripts Reference

| Command | Description |
|---------|-------------|
| `bun dev` | Start Astro dev server with hot reload |
| `bun start` | Alias for `bun dev` |
| `bun run build` | Build static site for production |
| `bun run preview` | Preview production build locally |
| `bun test` | Run tests once |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:ui` | Open Vitest UI |
| `bun run lint` | Run ESLint |
| `bun run clean` | Remove build artifacts |

## Why This Stack?

- **Astro**: Best-in-class static site generator with excellent DX
- **React 19**: Familiar component model with latest features
- **Bun**: Faster than npm/yarn, simpler tooling
- **Vitest**: Modern testing with browser mode for React components
- **Cloudflare Pages**: Fast global CDN with zero config deployment

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Personal website - all rights reserved.

## Contact

- **GitHub**: [bjnewman](https://github.com/bjnewman)
- **LinkedIn**: [bjnewman](https://linkedin.com/in/bjnewman)
- **Website**: [bjnewman.dev](https://bjnewman.dev)
