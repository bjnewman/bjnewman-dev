import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

interface BlogPost {
  frontmatter: {
    title: string;
    date: string;
    description?: string;
  };
}

export async function GET(context: APIContext) {
  const postFiles = import.meta.glob<BlogPost>('./blog/*.md', { eager: true });
  const posts = Object.entries(postFiles).map(([path, post]) => ({
    title: post.frontmatter.title,
    pubDate: new Date(post.frontmatter.date),
    link: path.replace('./blog/', '/blog/').replace('.md', '/'),
    description: post.frontmatter.description || `Read ${post.frontmatter.title} on bjnewman.dev`,
  }));

  return rss({
    title: "Ben Newman's Blog",
    description: 'Software engineering, tech leadership, and building scalable systems',
    site: context.site || 'https://bjnewman.dev',
    items: posts.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
    customData: `<language>en-us</language>`,
  });
}
