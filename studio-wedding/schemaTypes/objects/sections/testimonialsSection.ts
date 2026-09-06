import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionLabel',
      title: 'Admin Label',
      type: 'string',
      description: 'A short name to help you identify this section in the list. Only visible to you, not on the website.',
      initialValue: 'Testimonials',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section title, e.g. "What they say after the last dance".',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'testimonialItem',
          title: 'Testimonial',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              description: 'The couple\'s words about their experience.',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              name: 'author',
              title: 'Author Name',
              type: 'string',
              description: 'Who said this, e.g. "Marguerite".',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              name: 'photo',
              title: 'Author Photo',
              type: 'image',
              hotspot: true,
              description: 'Optional portrait photo of the person. Leave empty to show text only.',
            }),
          ],
          preview: {
            select: {
              title: 'author',
              subtitle: 'quote',
              media: 'photo',
            },
            prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
              return {
                title: title || 'Unnamed',
                subtitle: subtitle ? subtitle.slice(0, 60) + (subtitle.length > 60 ? '…' : '') : 'No quote',
                media: media || undefined,
              };
            },
          },
        },
      ],
      description: 'Add one or more testimonials. Drag to reorder.',
    }),
  ],
  preview: {
    select: {
      title: 'sectionLabel',
      subtitle: 'heading',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Testimonials',
        subtitle: subtitle || 'Testimonials section',
      };
    },
  },
});
