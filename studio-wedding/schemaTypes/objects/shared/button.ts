import { defineType, defineField } from 'sanity';
import { validLink } from './linkValidation';

export const button = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button Text',
      type: 'string',
      description: 'The text shown on the button, e.g. "Get in Touch".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'string',
      description: 'Where the button goes. Use a page path like "/contact" or a full URL like "https://example.com".',
      validation: (rule) => validLink(rule.required()),
    }),
    defineField({
      name: 'style',
      title: 'Button Style',
      type: 'string',
      options: {
        list: [
          { title: 'Solid (accent color)', value: 'solid' },
          { title: 'Outline', value: 'outline' },
        ],
        layout: 'radio',
      },
      initialValue: 'solid',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'link',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Untitled Button',
        subtitle: subtitle || 'No link set',
      };
    },
  },
});
