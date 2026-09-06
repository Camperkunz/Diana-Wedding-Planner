import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionLabel',
      title: 'Admin Label',
      type: 'string',
      description: 'A short name to help you identify this section in the list. Only visible to you, not on the website.',
      initialValue: 'Hero',
    }),
    defineField({
      name: 'heading',
      title: 'Main Heading',
      type: 'string',
      description: 'The large title text shown at the top of the hero.',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      description: 'The paragraph text below the main heading.',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      hotspot: true,
      description: 'The large photo behind the text. Recommended size: at least 1920×1080 pixels for sharp display on all screens.',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'button',
      description: 'The main call-to-action button (e.g. "Get in Touch").',
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button',
      type: 'button',
      description: 'An optional second button (e.g. "View Services"). Leave empty to hide.',
    }),
  ],
  preview: {
    select: {
      title: 'sectionLabel',
      subtitle: 'heading',
      media: 'backgroundImage',
    },
    prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
      return {
        title: title || 'Hero',
        subtitle: subtitle || 'Hero section',
        media: media || undefined,
      };
    },
  },
});
