import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './content', pattern: '**/index.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    draft: z.boolean().default(false),
    date: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
  }),
});

export const collections = {
  posts,
};
