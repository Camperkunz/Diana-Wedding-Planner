import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const galleryPreviewSection = defineType({
  name: 'galleryPreviewSection',
  title: 'Portfolio Preview',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionLabel',
      title: 'Admin Label',
      type: 'string',
      description: 'A short name to help you identify this section in the list. Only visible to you, not on the website.',
      initialValue: 'Portfolio Preview',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section title, e.g. "A few of my favourite days".',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
      description: 'Optional text shown below the heading.',
    }),
    defineField({
      name: 'featuredAlbums',
      title: 'Featured Albums',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'album' }],
          options: {
            disableNew: true,
          },
        },
      ],
      description: 'Select which albums to showcase. Drag to reorder.',
      validation: (rule: Rule) => rule.max(8).warning('Showing more than 8 albums may look crowded.'),
    }),
    defineField({
      name: 'viewAllButton',
      title: '"View All" Button',
      type: 'button',
      description: 'The button that links to the full portfolio page.',
    }),
  ],
  preview: {
    select: {
      title: 'sectionLabel',
      subtitle: 'heading',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Portfolio Preview',
        subtitle: subtitle || 'Gallery preview section',
      };
    },
  },
});
