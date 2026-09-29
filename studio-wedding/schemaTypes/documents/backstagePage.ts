import { defineType, defineField } from 'sanity'
import { heroHeading } from '../objects/shared/heroHeading'

export const backstagePage = defineType({
  name: 'backstagePage',
  title: 'Backstage Page',
  type: 'document',
  description: 'Manage the backstage hero, intro, videos and CTA. The video grid and player remain fixed.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'intro', title: '2. Introduction', options: { collapsible: true, collapsed: true } },
    { name: 'cta', title: '3. Final CTA', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero' }),
    heroHeading('heroHeading', 'Heading', 'hero'),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'introText', title: 'Introduction', type: 'text', rows: 5, fieldset: 'intro', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact' }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Backstage Page', subtitle: 'Fixed design · editable content only' }) },
})
