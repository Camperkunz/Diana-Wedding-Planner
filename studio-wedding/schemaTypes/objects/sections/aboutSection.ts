import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'About',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionLabel',
      title: 'Admin Label',
      type: 'string',
      description: 'A short name to help you identify this section in the list. Only visible to you, not on the website.',
      initialValue: 'About',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section title, e.g. "The planner who picks up the phone".',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'bodyText',
      title: 'Body Text',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The main paragraph(s) of text for this section.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      hotspot: true,
      description: 'The photo shown alongside the text. Recommended size: 800×1000 pixels (portrait).',
    }),
    defineField({
      name: 'layoutVariant',
      title: 'Image Position',
      type: 'string',
      options: {
        list: [
          { title: 'Image on the left', value: 'left' },
          { title: 'Image on the right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
      description: 'Choose which side the image appears on.',
    }),
  ],
  preview: {
    select: {
      title: 'sectionLabel',
      subtitle: 'heading',
      media: 'image',
    },
    prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
      return {
        title: title || 'About',
        subtitle: subtitle || 'About section',
        media: media || undefined,
      };
    },
  },
});
