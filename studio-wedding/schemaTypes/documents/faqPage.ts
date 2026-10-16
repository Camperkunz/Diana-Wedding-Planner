import { defineType, defineField } from 'sanity'
import { heroHeading } from '../objects/shared/heroHeading'
import { validLink } from '../objects/shared/linkValidation'

export const faqPage = defineType({
  name: 'faqPage',
  title: 'FAQ Page',
  type: 'document',
  description: 'Manage the FAQ page copy and questions. The accordion design stays fixed.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'questions', title: '2. Questions & Answers', options: { collapsible: true, collapsed: true } },
    { name: 'contact', title: '3. Still Have Questions', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero' }),
    heroHeading('heroHeading', 'Heading', 'hero'),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({
      name: 'items', title: 'FAQ Items', type: 'array', fieldset: 'questions', of: [{
        type: 'object', name: 'faqItem',
        preview: {
          select: { title: 'question', subtitle: 'category' },
          prepare: ({ title, subtitle }: Record<string, any>) => ({
            title: title || 'Untitled question',
            subtitle,
          }),
        },
        fields: [
          defineField({ name: 'category', title: 'Category', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 6, validation: (rule) => rule.required() }),
        ]
      }]
    }),
    defineField({ name: 'contactHeading', title: 'Heading', type: 'string', fieldset: 'contact', validation: (rule) => rule.required() }),
    defineField({ name: 'contactDescription', title: 'Description', type: 'text', rows: 5, fieldset: 'contact', validation: (rule) => rule.required() }),
    defineField({ name: 'contactButtonLabel', title: 'Button Label', type: 'string', fieldset: 'contact' }),
    defineField({ name: 'contactButtonLink', title: 'Button Link', type: 'string', fieldset: 'contact', initialValue: '/contact', validation: (rule) => validLink(rule) }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'FAQ Page', subtitle: 'Fixed design · editable content only' }) },
})
