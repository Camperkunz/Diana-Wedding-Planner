import {defineType, defineField} from 'sanity'

const navItem = {
  type: 'object', name: 'navLink', title: 'Navigation Link', fields: [
    defineField({name: 'label', title: 'Menu Label', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'link', title: 'Destination', type: 'string', description: 'Example: /about or https://example.com', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'label', subtitle: 'link'}},
}

export const siteLayout = defineType({
  name: 'siteLayout',
  title: 'Header & Footer',
  type: 'document',
  description: 'Control the words and links in the global header and footer. The visual layout stays fixed.',
  fieldsets: [
    {name: 'header', title: 'Header & Navigation', options: {collapsible: true, collapsed: false}},
    {name: 'footer', title: 'Footer', options: {collapsible: true, collapsed: false}},
  ],
  fields: [
    defineField({name: 'headerLogo', title: 'Header Logo Override', type: 'image', fieldset: 'header', options: {hotspot: true}, description: 'Optional. Leave empty to use the main logo from Site Settings.'}),
    defineField({name: 'navLinks', title: 'Main Menu', type: 'array', fieldset: 'header', of: [navItem], description: 'Drag items to change their order.'}),
    defineField({name: 'footerDescription', title: 'Footer Description', type: 'text', rows: 3, fieldset: 'footer'}),
    defineField({name: 'footerExploreLabel', title: 'Footer Navigation Heading', type: 'string', fieldset: 'footer', initialValue: 'Explore'}),
    defineField({name: 'footerContactLabel', title: 'Footer Contact Heading', type: 'string', fieldset: 'footer', initialValue: 'Get in Touch'}),
    defineField({name: 'footerNavLinks', title: 'Footer Menu', type: 'array', fieldset: 'footer', of: [navItem]}),
    defineField({name: 'footerEmail', title: 'Footer Email Override', type: 'string', fieldset: 'footer', description: 'Optional. Leave empty to use the email from Site Settings.'}),
    defineField({name: 'footerPhone', title: 'Footer Phone Override', type: 'string', fieldset: 'footer', description: 'Optional. Leave empty to use the phone from Site Settings.'}),
    defineField({name: 'footerAddress', title: 'Footer Address Override', type: 'string', fieldset: 'footer', description: 'Optional. Leave empty to use the address from Site Settings.'}),
    defineField({name: 'footerSocialLinks', title: 'Footer Social Links Override', type: 'array', fieldset: 'footer', of: [{type: 'socialLink'}], description: 'Optional. Leave empty to use Site Settings social accounts.'}),
    defineField({name: 'copyrightText', title: 'Copyright Text', type: 'string', fieldset: 'footer', initialValue: '© 2026 Diana Voloshina. All rights reserved.'}),
  ],
  preview: {prepare: () => ({title: 'Header & Footer', subtitle: 'Global navigation and footer content'})},
})
