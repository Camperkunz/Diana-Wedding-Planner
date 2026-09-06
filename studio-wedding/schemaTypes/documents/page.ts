import { defineType, defineField } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The name of this page, shown in the browser tab and search results.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Page URL',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'The web address for this page. Click "Generate" to create it from the title.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      description: 'Search engine and social share settings for this page.',
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'sections',
      description: 'The sections that make up this page. Add, remove, and reorder them.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Untitled Page',
        subtitle: subtitle ? `/${subtitle}` : 'No URL set',
      };
    },
  },
});
