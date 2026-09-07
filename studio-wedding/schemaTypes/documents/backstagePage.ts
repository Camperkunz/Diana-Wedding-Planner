import {defineType, defineField} from 'sanity'

export const backstagePage = defineType({
  name: 'backstagePage',
  title: 'Backstage Page',
  type: 'document',
  description: 'Manage the backstage hero, intro, videos and CTA. The video grid and player remain fixed.',
  fieldsets: [
    {name: 'hero', title: '1. Hero', options: {collapsible: true, collapsed: false}},
    {name: 'intro', title: '2. Introduction', options: {collapsible: true, collapsed: false}},
    {name: 'cta', title: '3. Final CTA', options: {collapsible: true, collapsed: true}},
    {name: 'seo', title: 'SEO', options: {collapsible: true, collapsed: true}},
  ],
  fields: [
    defineField({name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero'}),
    defineField({name: 'heroHeadingLine1', title: 'Heading — First Part', type: 'string', fieldset: 'hero'}),
    defineField({name: 'heroHeadingScript', title: 'Heading — Script Word', type: 'string', fieldset: 'hero'}),
    defineField({name: 'heroImage', title: 'Background Photo', type: 'image', options: {hotspot: true}, fieldset: 'hero'}),
    defineField({name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero'}),
    defineField({name: 'introText', title: 'Introduction', type: 'text', rows: 5, fieldset: 'intro'}),
    defineField({name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta'}),
    defineField({name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta'}),
    defineField({name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact'}),
    defineField({name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Backstage Page', subtitle: 'Fixed design · editable content only'})},
})
