/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

// Use Vite's import.meta.glob to get all blog posts as raw strings
const blogPosts = import.meta.glob('/src/pages/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('Blog Posts', () => {
  const postEntries = Object.entries(blogPosts);

  it('should have at least one blog post', () => {
    expect(postEntries.length).toBeGreaterThan(0);
  });

  it('all blog posts should have a layout specified', () => {
    const postsWithoutLayout: string[] = [];

    for (const [path, content] of postEntries) {
      const filename = path.split('/').pop() || path;
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        postsWithoutLayout.push(`${filename} (no frontmatter)`);
        continue;
      }

      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes('layout:')) {
        postsWithoutLayout.push(filename);
      }
    }

    expect(
      postsWithoutLayout,
      `Posts missing layout: ${postsWithoutLayout.join(', ')}`
    ).toHaveLength(0);
  });

  it('all blog posts should have a title', () => {
    const postsWithoutTitle: string[] = [];

    for (const [path, content] of postEntries) {
      const filename = path.split('/').pop() || path;
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        postsWithoutTitle.push(`${filename} (no frontmatter)`);
        continue;
      }

      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes('title:')) {
        postsWithoutTitle.push(filename);
      }
    }

    expect(postsWithoutTitle, `Posts missing title: ${postsWithoutTitle.join(', ')}`).toHaveLength(
      0
    );
  });

  it('all blog posts should have a date', () => {
    const postsWithoutDate: string[] = [];

    for (const [path, content] of postEntries) {
      const filename = path.split('/').pop() || path;
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        postsWithoutDate.push(`${filename} (no frontmatter)`);
        continue;
      }

      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes('date:')) {
        postsWithoutDate.push(filename);
      }
    }

    expect(postsWithoutDate, `Posts missing date: ${postsWithoutDate.join(', ')}`).toHaveLength(0);
  });

  it('all blog posts should use BlogPost layout', () => {
    const postsWithWrongLayout: string[] = [];

    for (const [path, content] of postEntries) {
      const filename = path.split('/').pop() || path;
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        postsWithWrongLayout.push(`${filename} (no frontmatter)`);
        continue;
      }

      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes('layout: ../../layouts/BlogPost.astro')) {
        postsWithWrongLayout.push(filename);
      }
    }

    expect(
      postsWithWrongLayout,
      `Posts not using BlogPost layout: ${postsWithWrongLayout.join(', ')}`
    ).toHaveLength(0);
  });
});
