import { defineType, defineField } from 'sanity'

export const portfolioPage = defineType({
  name: 'portfolioPage',
  title: 'Portfolio Page',
  type: 'document',
  description: 'Edit the portfolio introduction, hero and CTA. Wedding albums are managed separately.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'intro', title: '2. Introduction', options: { collapsible: true, collapsed: true } },
    { name: 'cta', title: '3. Final CTA', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingScript', title: 'Heading — Script Word', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingRest', title: 'Heading — Remaining Text', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero' }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'introText', title: 'Introduction', type: 'text', rows: 5, fieldset: 'intro' }),
    defineField({ name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact' }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Portfolio Page', subtitle: 'Fixed design · editable content only' }) },
})
