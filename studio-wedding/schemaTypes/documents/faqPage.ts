import { defineType, defineField } from 'sanity'

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
    defineField({ name: 'heroHeadingLine1', title: 'Heading — First Part', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingScript', title: 'Heading — Script Word', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero' }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero' }),
    defineField({
      name: 'items', title: 'FAQ Items', type: 'array', fieldset: 'questions', of: [{
        type: 'object', name: 'faqItem', fields: [
          defineField({ name: 'category', title: 'Category', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 6, validation: (rule) => rule.required() }),
        ]
      }]
    }),
    defineField({ name: 'contactHeading', title: 'Heading', type: 'string', fieldset: 'contact' }),
    defineField({ name: 'contactDescription', title: 'Description', type: 'text', rows: 5, fieldset: 'contact' }),
    defineField({ name: 'contactButtonLabel', title: 'Button Label', type: 'string', fieldset: 'contact' }),
    defineField({ name: 'contactButtonLink', title: 'Button Link', type: 'string', fieldset: 'contact', initialValue: '/contact' }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'FAQ Page', subtitle: 'Fixed design · editable content only' }) },
})
