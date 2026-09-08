import { defineType, defineField } from 'sanity'

const navItem = {
  type: 'object',
  name: 'navLink',
  title: 'Navigation Link',
  fields: [
    defineField({ name: 'label', title: 'Menu Label', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'link', title: 'Destination', type: 'string', description: 'Example: /about or https://example.com', validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'link' } },
}

export const siteLayout = defineType({
  name: 'siteLayout',
  title: 'Header & Footer',
  type: 'document',
  description: 'Control the navigation links and labels in the global header and footer.',
  fieldsets: [
    { name: 'header', title: 'Header & Navigation', options: { collapsible: true, collapsed: true } },
    { name: 'footer', title: 'Footer', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'headerLogo',
      title: 'Header Logo (Override)',
      type: 'image',
      fieldset: 'header',
      options: { hotspot: true },
      description: 'Optional. Only needed if the header logo should be different from the main logo in Business & Contact Info. Leave empty to use that logo everywhere.',
    }),
    defineField({
      name: 'navLinks',
      title: 'Main Menu Links',
      type: 'array',
      fieldset: 'header',
      of: [navItem],
      description: 'Drag items to change their order in the header menu.',
    }),
    defineField({
      name: 'footerDescription',
      title: 'Footer Description',
      type: 'text',
      rows: 3,
      fieldset: 'footer',
    }),
    defineField({
      name: 'footerExploreLabel',
      title: 'Footer Navigation Heading',
      type: 'string',
      fieldset: 'footer',
      initialValue: 'Explore',
    }),
    defineField({
      name: 'footerContactLabel',
      title: 'Footer Contact Heading',
      type: 'string',
      fieldset: 'footer',
      initialValue: 'Get in Touch',
    }),
    defineField({
      name: 'footerNavLinks',
      title: 'Footer Menu Links',
      type: 'array',
      fieldset: 'footer',
      of: [navItem],
    }),
    defineField({
      name: 'footerEmail',
      title: 'Footer Email (Override)',
      type: 'string',
      fieldset: 'footer',
      description: 'Optional. Only needed if the footer should show a different email than Business & Contact Info.',
    }),
    defineField({
      name: 'footerPhone',
      title: 'Footer Phone (Override)',
      type: 'string',
      fieldset: 'footer',
      description: 'Optional. Only needed if the footer should show a different phone than Business & Contact Info.',
    }),
    defineField({
      name: 'footerAddress',
      title: 'Footer Address (Override)',
      type: 'string',
      fieldset: 'footer',
      description: 'Optional. Only needed if the footer should show a different address than Business & Contact Info.',
    }),
    defineField({
      name: 'footerSocialLinks',
      title: 'Footer Social Links (Override)',
      type: 'array',
      fieldset: 'footer',
      of: [{ type: 'socialLink' }],
      description: 'Optional. Only needed if the footer should show different social links than Business & Contact Info.',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      fieldset: 'footer',
      initialValue: '© 2026 Diana Voloshina. All rights reserved.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Header & Footer', subtitle: 'Global navigation and footer content' }) },
})