import { defineType, defineField } from 'sanity';

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social Media Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Pinterest', value: 'pinterest' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'radio',
      },
      initialValue: 'instagram',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link URL',
      type: 'url',
      description: 'The full web address, e.g. "https://instagram.com/yourname".',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
  ],
  preview: {
    select: {
      title: 'platform',
      subtitle: 'url',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      const label = title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Social Link';
      return {
        title: label,
        subtitle: subtitle || 'No URL set',
      };
    },
  },
});
