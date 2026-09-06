import {defineType, defineField} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  description: 'Business information and defaults used throughout the website. You normally only need to edit this once.',
  fieldsets: [
    {name: 'business', title: 'Business Information', options: {collapsible: true, collapsed: false}},
    {name: 'branding', title: 'Logo & Browser Icon', options: {collapsible: true, collapsed: true}},
    {name: 'contact', title: 'Contact Details', options: {collapsible: true, collapsed: true}},
    {name: 'social', title: 'Social Media', options: {collapsible: true, collapsed: true}},
    {name: 'seo', title: 'Default SEO', options: {collapsible: true, collapsed: true}},
  ],
  fields: [
    defineField({name: 'siteTitle', title: 'Business / Website Name', type: 'string', fieldset: 'business', description: 'Example: Diana Voloshina Weddings.', validation: (rule) => rule.required()}),
    defineField({name: 'tagline', title: 'Short Tagline', type: 'string', fieldset: 'business', description: 'A short phrase used in places such as the footer and metadata.'}),
    defineField({name: 'location', title: 'Base Location', type: 'string', fieldset: 'business', description: 'Example: Ottawa, Ontario.'}),
    defineField({name: 'serviceArea', title: 'Service Area', type: 'string', fieldset: 'business', description: 'Example: Ottawa · Gatineau · Eastern Ontario.'}),
    defineField({name: 'logo', title: 'Main Logo', type: 'image', fieldset: 'branding', options: {hotspot: true}, description: 'Used by default in the header. Transparent PNG or SVG-style artwork works best.'}),
    defineField({name: 'logoAlt', title: 'Logo Description', type: 'string', fieldset: 'branding', description: 'A short description for accessibility, e.g. “Diana Voloshina Weddings logo”.'}),
    defineField({name: 'favicon', title: 'Browser Icon (Favicon)', type: 'image', fieldset: 'branding', description: 'The small icon shown in browser tabs. A square image works best.'}),
    defineField({name: 'email', title: 'Email', type: 'string', fieldset: 'contact', validation: (rule) => rule.email()}),
    defineField({name: 'phone', title: 'Phone', type: 'string', fieldset: 'contact'}),
    defineField({name: 'address', title: 'Address', type: 'string', fieldset: 'contact'}),
    defineField({name: 'socialLinks', title: 'Social Media Accounts', type: 'array', fieldset: 'social', description: 'Add only the accounts you actually use. Drag to reorder.', of: [{type: 'socialLink'}]}),
    defineField({name: 'seo', title: 'Default Search & Social Settings', type: 'seo', fieldset: 'seo', description: 'These are fallback SEO settings used when a page does not have its own SEO values.'}),
  ],
  preview: {select: {title: 'siteTitle', subtitle: 'tagline', media: 'logo'}, prepare({title, subtitle, media}: {title?: string; subtitle?: string; media?: any}) {return {title: title || 'Site Settings', subtitle: subtitle || 'Business information and defaults', media}}},
})
