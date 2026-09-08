import { defineType, defineField } from 'sanity'

const image = (name: string, title: string, fieldset: string, description?: string) =>
  defineField({ name, title, type: 'image', options: { hotspot: true }, fieldset, description })
const text = (name: string, title: string, fieldset: string, rows = 5) =>
  defineField({ name, title, type: 'text', rows, fieldset })

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  description: 'Edit the content of the existing About page. Layout and styling are fixed in the website.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'story', title: '2. My Story', options: { collapsible: true, collapsed: true } },
    { name: 'glance', title: '3. At a Glance', options: { collapsible: true, collapsed: true } },
    { name: 'philosophy', title: '4. My Philosophy', options: { collapsible: true, collapsed: true } },
    { name: 'stats', title: '5. Stats', options: { collapsible: true, collapsed: true } },
    { name: 'testimonials', title: '6. Testimonials', options: { collapsible: true, collapsed: true } },
    { name: 'cta', title: '7. Final CTA', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    text('heroEyebrow', 'Eyebrow', 'hero', 2),
    defineField({ name: 'heroHeadingLine1', title: 'Heading — First Line', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingScript', title: 'Heading — Script Word', type: 'string', fieldset: 'hero' }),
    image('heroImage', 'Background Photo', 'hero', 'Recommended: 1920px wide or larger.'),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'storyEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'story' }),
    defineField({ name: 'storyHeading', title: 'Heading', type: 'string', fieldset: 'story' }),
    text('storyParagraphs', 'Story Paragraphs', 'story', 8),
    image('storyImage', 'Photo', 'story'),
    defineField({ name: 'storyImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'story' }),
    defineField({ name: 'glanceEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'glance' }),
    defineField({
      name: 'glanceItems', title: 'Highlights', type: 'array', fieldset: 'glance', of: [{
        type: 'object', name: 'glanceItem', fields: [
          defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: ['award', 'heart', 'location'] } }),
          defineField({ name: 'text', title: 'Text', type: 'string', validation: (rule) => rule.required() }),
        ]
      }]
    }),
    defineField({ name: 'philosophyEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'philosophy' }),
    defineField({ name: 'philosophyHeading', title: 'Heading', type: 'string', fieldset: 'philosophy' }),
    defineField({
      name: 'philosophyItems', title: 'Beliefs', type: 'array', fieldset: 'philosophy', validation: (rule) => rule.max(6), of: [{
        type: 'object', name: 'philosophyItem', fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'body', title: 'Description', type: 'text', rows: 5, validation: (rule) => rule.required() }),
        ]
      }]
    }),
    defineField({
      name: 'stats', title: 'Stats', type: 'array', fieldset: 'stats', validation: (rule) => rule.max(4), of: [{
        type: 'object', name: 'aboutStat', fields: [
          defineField({ name: 'value', title: 'Value', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
        ]
      }]
    }),
    defineField({ name: 'testimonialsEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'testimonials' }),
    defineField({ name: 'testimonialsHeading', title: 'Heading', type: 'string', fieldset: 'testimonials' }),
    defineField({ name: 'testimonialsIntro', title: 'Intro Text', type: 'text', rows: 3, fieldset: 'testimonials' }),
    defineField({
      name: 'testimonials', title: 'Testimonials', type: 'array', fieldset: 'testimonials', validation: (rule) => rule.max(3), of: [{
        type: 'object', name: 'aboutTestimonial', fields: [
          defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 5, validation: (rule) => rule.required() }),
          defineField({ name: 'author', title: 'Couple / Author', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'weddingType', title: 'Wedding Type', type: 'string' }),
        ]
      }]
    }),
    defineField({ name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta' }),
    text('ctaDescription', 'Description', 'cta', 4),
    defineField({ name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact' }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'About Page', subtitle: 'Fixed design · editable content only' }) },
})
