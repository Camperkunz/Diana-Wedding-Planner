import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'Search & Social Preview',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle', title: 'Google / Browser Title', type: 'string',
      description: 'The title shown in search results and browser tabs. Aim for 50–60 characters.',
      validation: (rule) => rule.max(60).warning(),
    }),
    defineField({
      name: 'metaDescription', title: 'Google Search Description', type: 'text', rows: 3,
      description: 'The short description under the page title in Google. Aim for 140–160 characters.',
      validation: (rule) => rule.max(160).warning(),
    }),
    defineField({
      name: 'ogImage', title: 'Social Share Image', type: 'image', options: { hotspot: true },
      description: 'The image used when this page is shared on social media or in messages. Recommended: 1200 × 630 px.',
    }),
    defineField({
      name: 'canonicalUrl', title: 'Canonical URL', type: 'url',
      description: 'Usually leave this empty. Only use it when this page should point search engines to another URL.',
    }),
    defineField({
      name: 'noIndex', title: 'Hide from Search Engines', type: 'boolean', initialValue: false,
      description: 'Turn this on only for pages that should not appear in Google.',
    }),
    defineField({
      name: 'noFollow', title: 'Do Not Follow Links', type: 'boolean', initialValue: false,
      description: 'Usually leave this off. Use only when you specifically want search engines not to follow links on this page.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Search & Social Preview', subtitle: 'Google and social sharing settings' }) },
})
