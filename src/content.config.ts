import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './content/posts', pattern: '**/index.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      template: z.string().optional(),
      title: z.string(),
      slug: z.string().optional(),
      draft: z.boolean().default(false),
      date: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ base: './content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    template: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  pages,
  posts,
};
