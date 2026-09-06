import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to Action',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionLabel',
      title: 'Admin Label',
      type: 'string',
      description: 'A short name to help you identify this section in the list. Only visible to you, not on the website.',
      initialValue: 'Call to Action',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The main title for this section, e.g. "Your wedding deserves someone who shows up".',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 3,
      description: 'Supporting text below the heading.',
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'button',
      description: 'The action button for this section (e.g. "Start a Conversation").',
    }),
  ],
  preview: {
    select: {
      title: 'sectionLabel',
      subtitle: 'heading',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Call to Action',
        subtitle: subtitle || 'CTA section',
      };
    },
  },
});
