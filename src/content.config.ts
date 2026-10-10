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
      archived: z.boolean().default(false),
      date: z.string(),
      updated: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      series: z
        .object({
          title: z.string(),
          slug: z.string().optional(),
          order: z.number().int().positive(),
        })
        .optional(),
      image: image().optional(),
    }),
});

export const collections = {
  posts,
};
