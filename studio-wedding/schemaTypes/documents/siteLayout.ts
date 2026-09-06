import { defineType, defineField } from 'sanity';

export const siteLayout = defineType({
  name: 'siteLayout',
  title: 'Header & Footer',
  type: 'document',
  // Singleton — hardcoded ID is managed in deskStructure.ts
  fieldsets: [
    {
      name: 'header',
      title: 'Header (Top Navigation Bar)',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'footer',
      title: 'Footer (Bottom of Every Page)',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    // ── Header ──
    defineField({
      name: 'headerLogo',
      title: 'Header Logo Override',
      type: 'image',
      options: { hotspot: true },
      fieldset: 'header',
      description: 'Optional. Use a different logo in the header than the one in Site Settings. Leave empty to use the default.',
    }),
    defineField({
      name: 'navLinks',
      title: 'Navigation Links',
      type: 'array',
      fieldset: 'header',
      of: [
        {
          type: 'object',
          name: 'navLink',
          title: 'Navigation Link',
          fields: [
            defineField({
              name: 'label',
              title: 'Link Text',
              type: 'string',
              description: 'The text shown in the menu, e.g. "Services".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              description: 'Where the link goes, e.g. "/services" or "https://example.com".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Display Order',
              type: 'number',
              description: 'Lower numbers appear first. Use 1, 2, 3, etc.',
              initialValue: 1,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'link',
            },
            prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
              return {
                title: title || 'Untitled Link',
                subtitle: subtitle || 'No link set',
              };
            },
          },
        },
      ],
      description: 'The menu links shown in the top navigation bar. Drag to reorder.',
    }),

    // ── Footer ──
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      fieldset: 'footer',
      description: 'The text at the very bottom of the page, e.g. "© 2025 Diana Voloshina. All rights reserved."',
      initialValue: '© 2025 Diana Voloshina. All rights reserved.',
    }),
    defineField({
      name: 'footerNavLinks',
      title: 'Footer Navigation Links',
      type: 'array',
      fieldset: 'footer',
      of: [
        {
          type: 'object',
          name: 'footerNavLink',
          title: 'Footer Link',
          fields: [
            defineField({
              name: 'label',
              title: 'Link Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'link',
            },
            prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
              return {
                title: title || 'Untitled Link',
                subtitle: subtitle || 'No link set',
              };
            },
          },
        },
      ],
      description: 'Links shown in the footer area. Drag to reorder.',
    }),
    defineField({
      name: 'footerEmail',
      title: 'Contact Email',
      type: 'string',
      fieldset: 'footer',
      description: 'The email address shown in the footer.',
    }),
    defineField({
      name: 'footerPhone',
      title: 'Contact Phone',
      type: 'string',
      fieldset: 'footer',
      description: 'The phone number shown in the footer.',
    }),
    defineField({
      name: 'footerAddress',
      title: 'Address',
      type: 'string',
      fieldset: 'footer',
      description: 'The mailing or physical address shown in the footer.',
    }),
    defineField({
      name: 'footerSocialLinks',
      title: 'Footer Social Links Override',
      type: 'array',
      fieldset: 'footer',
      of: [{ type: 'socialLink' }],
      description: 'Optional. Use different social links in the footer than the ones in Site Settings. Leave empty to use the defaults.',
    }),
  ],
  preview: {
    select: {
      title: 'copyrightText',
    },
    prepare({ title }: { title?: string }) {
      return {
        title: title || 'Header & Footer',
        subtitle: 'Navigation and footer settings',
      };
    },
  },
});
