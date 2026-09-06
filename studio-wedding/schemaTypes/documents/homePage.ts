import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Singleton — hardcoded ID is managed in deskStructure.ts
  fields: [
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Search engine and social share settings for the home page.',
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'sections',
      description: 'The sections that make up the home page. Add, remove, and reorder them. Each section has an "Admin Label" field to help you identify it in this list.',
    }),
  ],
  preview: {
    select: {
      title: 'sections',
    },
    prepare() {
      return {
        title: 'Home Page',
        subtitle: 'Main landing page',
      };
    },
  },
});
