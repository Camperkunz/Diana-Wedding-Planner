import {defineType, defineField} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  description: 'One of Diana’s service packages. These details appear on the Services page and selected cards on the homepage.',
  fieldsets: [
    {name: 'basic', title: 'Service Details', options: {collapsible: true, collapsed: false}},
    {name: 'content', title: 'Descriptions & Included Items', options: {collapsible: true, collapsed: false}},
    {name: 'image', title: 'Photo', options: {collapsible: true, collapsed: true}},
    {name: 'display', title: 'Website Display', options: {collapsible: true, collapsed: true}},
  ],
  fields: [
    defineField({name: 'name', title: 'Service Name', type: 'string', fieldset: 'basic', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'URL Slug', type: 'slug', fieldset: 'basic', options: {source: 'name', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({name: 'startingPrice', title: 'Starting Price', type: 'string', fieldset: 'basic', description: 'Example: From $6,500.'}),
    defineField({name: 'shortDescription', title: 'Short Description', type: 'text', rows: 4, fieldset: 'content', description: 'Used on the homepage service cards.'}),
    defineField({name: 'fullDescription', title: 'Full Description', type: 'text', rows: 7, fieldset: 'content', description: 'Longer explanation shown on the Services page.'}),
    defineField({name: 'includes', title: 'What Is Included', type: 'array', fieldset: 'content', of: [{type: 'string'}], description: 'Add one included item per line. Drag to reorder.'}),
    defineField({name: 'image', title: 'Service Photo', type: 'image', fieldset: 'image', options: {hotspot: true}}),
    defineField({name: 'imageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'image'}),
    defineField({name: 'featured', title: 'Show on Homepage', type: 'boolean', fieldset: 'display', initialValue: true}),
    defineField({name: 'order', title: 'Display Order', type: 'number', fieldset: 'display', initialValue: 1, description: 'Lower numbers appear first.'}),
  ],
  preview: {select: {title: 'name', subtitle: 'startingPrice', media: 'image'}},
})
