import { defineCollection, z } from 'astro:content';

/**
 * Project metadata shared by the home page and the case-study pages
 * (PHASE3_ARCH section 8). Statuses follow PROJECT_CONTEXT section 5.1.
 */
const projects = defineCollection({
  type: 'data',
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string(),
    shortName: z.string(),
    status: z.enum(['implemented', 'prototype', 'live', 'in-analysis']),
  }),
});

export const collections = { projects };
