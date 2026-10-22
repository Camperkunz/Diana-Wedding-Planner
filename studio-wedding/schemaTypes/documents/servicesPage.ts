import { defineType, defineField } from 'sanity'
import { heroHeading } from '../objects/shared/heroHeading'
import { validLink } from '../objects/shared/linkValidation'

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
    heroHeading('heroHeading', 'Heading', 'hero'),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'overviewEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'overview' }),
    defineField({ name: 'overviewHeading', title: 'Heading', type: 'string', fieldset: 'overview', validation: (rule) => rule.required() }),
    defineField({ name: 'overviewDescription', title: 'Description', type: 'text', rows: 6, fieldset: 'overview', validation: (rule) => rule.required() }),
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
    defineField({
      name: 'comparisonNote',
      title: 'Note Under the Table',
      type: 'text',
      rows: 3,
      fieldset: 'comparison',
      description:
        'Optional. Shown as a small note under the comparison table — e.g. what “—” means, or a “prices are starting points” disclaimer. Leave it empty and nothing appears on the page.',
    }),
    defineField({ name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaDescription', title: 'Description', type: 'text', rows: 5, fieldset: 'cta', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact', validation: (rule) => validLink(rule) }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Services Page', subtitle: 'Fixed design · editable content only' }) },
})