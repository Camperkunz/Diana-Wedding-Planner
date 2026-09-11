import { defineType, defineField } from 'sanity'

export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  description: 'Edit the text, hero and comparison table around the service cards. Service details are managed separately under Services.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'overview', title: '2. Overview', options: { collapsible: true, collapsed: true } },
    { name: 'comparison', title: '3. Comparison Table', options: { collapsible: true, collapsed: true } },
    { name: 'cta', title: '4. Final CTA', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingLine1', title: 'Heading — First Part', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingScript', title: 'Heading — Script Word', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingLine2', title: 'Heading — Last Part', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero' }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'overviewEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'overview' }),
    defineField({ name: 'overviewHeading', title: 'Heading', type: 'string', fieldset: 'overview' }),
    defineField({ name: 'overviewDescription', title: 'Description', type: 'text', rows: 6, fieldset: 'overview' }),
    defineField({ name: 'comparisonEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'comparison' }),
    defineField({ name: 'comparisonHeading', title: 'Heading', type: 'string', fieldset: 'comparison' }),
    defineField({
      name: 'comparisonRows',
      title: 'Rows',
      type: 'array',
      fieldset: 'comparison',
      description: 'Each row is a feature. Add a value for every service that should show something in this row — services left out will show "—" automatically. Columns in the table are generated automatically from your Services list, in the same order as on the page above.',
      of: [{
        type: 'object',
        name: 'comparisonRow',
        fields: [
          defineField({ name: 'label', title: 'Feature', type: 'string', validation: (rule) => rule.required() }),
          defineField({
            name: 'values',
            title: 'Values Per Service',
            type: 'array',
            description: 'Add one entry per service, choose the service, and type its value for this row (e.g. Yes, Unlimited, 2/month, —).',
            of: [{
              type: 'object',
              name: 'comparisonValue',
              fields: [
                defineField({ name: 'service', title: 'Service', type: 'reference', to: [{ type: 'service' }], validation: (rule) => rule.required() }),
                defineField({ name: 'value', title: 'Value', type: 'string', validation: (rule) => rule.required() }),
              ],
              preview: {
                select: { title: 'service.name', subtitle: 'value' },
              },
            }],
          }),
        ],
        preview: {
          select: { title: 'label', count: 'values.length' },
          prepare: (value: Record<string, any>) => ({
            title: value.title,
            subtitle: `${value.count || 0} service value(s)`,
          }),
        },
      }],
    }),
    defineField({ name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaDescription', title: 'Description', type: 'text', rows: 5, fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact' }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Services Page', subtitle: 'Fixed design · editable content only' }) },
})