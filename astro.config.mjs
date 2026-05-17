import mdx from '@astrojs/mdx';
import { defineConfig, passthroughImageService } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

export default defineConfig({
  integrations: [mdx()],
  devToolbar: {
    enabled: false,
  },
  image: {
    service: passthroughImageService(),
  },
  markdown: {
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }]],
  },
  site: 'https://rowlandekemezie.com',
});
