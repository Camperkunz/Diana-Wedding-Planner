import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO Settings',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Page Title (for search engines)',
      type: 'string',
      description: 'The title that appears in browser tabs and Google search results. Keep it under 60 characters.',
      validation: (rule: Rule) => rule.max(60).warning(),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Search Description',
      type: 'text',
      rows: 3,
      description: 'A short summary shown in search results. Aim for 150–160 characters.',
      validation: (rule: Rule) => rule.max(160).warning(),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      type: 'image',
      hotspot: true,
      description: 'Image shown when this page is shared on Facebook, Twitter, or messaging apps. Recommended size: 1200×630 pixels.',
    }),
  ],
  preview: {
    select: {
      title: 'metaTitle',
      subtitle: 'metaDescription',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'SEO Settings',
        subtitle: subtitle || 'No description set',
      };
    },
  },
});
