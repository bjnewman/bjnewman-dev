# BJ Newman's Personal Website

A hybrid static site using Eleventy for content and React for interactive components.

## Quick Start

```bash
# Install dependencies
bun install

# Develop Eleventy site (recommended for content work)
bun run dev:eleventy

# Develop React components in isolation
bun dev

# Build for production
bun run build

# Clean build artifacts
bun run clean
```

## Tech Stack

- **Static Site Generator**: Eleventy 3.0
- **Interactive Components**: React 19.1 + Vite 7.1
- **Package Manager**: Bun
- **Templating**: Nunjucks
- **Styling**: CSS with custom properties
- **TypeScript**: For React components

## Architecture

This project uses an Eleventy-first architecture where:
- Eleventy handles all pages, navigation, and site structure
- React is only used for specific interactive components when needed

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation on:
- Directory structure
- Build process
- How to add React components
- Styling strategy
- Development workflow

## Project Structure

```
/content/        # Eleventy templates and markdown
/src/            # React components and styles
/public/         # Build output (gitignored)
```

## Development

- **Content pages**: Edit files in `/content/` (`.njk` or `.md`)
- **Interactive components**: Create React components in `/src/components/`
- **Styles**: Global styles in `/src/styles/theme.css`, component styles in `/src/styles/components.css`

## Scripts

- `bun dev` - Vite dev server for React components
- `bun run dev:eleventy` - Eleventy dev server with live reload
- `bun run build` - Production build (Vite + Eleventy)
- `bun run build:vite` - Build React app only
- `bun run build:eleventy` - Build Eleventy site only
- `bun run lint` - Run ESLint
- `bun run clean` - Remove build artifacts

## Notes

- The build process runs Vite first, then Eleventy
- React components are only loaded on pages that explicitly mount them
- Most pages are pure static HTML for better performance and SEO