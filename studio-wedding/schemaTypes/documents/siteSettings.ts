import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — hardcoded ID is managed in deskStructure.ts
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'The name of your website, e.g. "Diana Voloshina Weddings".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short phrase under your name, e.g. "Wedding Planner · Ottawa".',
    }),
    defineField({
      name: 'logo',
      title: 'Logo Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Your logo. If you don\'t have one yet, the site title text will be shown instead. Recommended: a horizontal logo on a transparent background.',
    }),
    defineField({
      name: 'logoAlt',
      title: 'Logo Alt Text',
      type: 'string',
      description: 'A short text description of the logo for screen readers, e.g. "Diana Voloshina Weddings logo".',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      options: { hotspot: true },
      description: 'The small icon shown in browser tabs. Recommended: a simple square image, at least 32×32 pixels.',
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'color',
      description: 'The main highlight color used for buttons, links, and headings across the site. Click to pick a color.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [{ type: 'socialLink' }],
      description: 'Add your social media profiles. These appear in the footer and contact areas.',
    }),
    defineField({
      name: 'seo',
      title: 'Default SEO',
      type: 'seo',
      description: 'Search engine and social share settings used when a page doesn\'t have its own.',
    }),
  ],
  preview: {
    select: {
      title: 'siteTitle',
      subtitle: 'tagline',
      media: 'logo',
    },
    prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
      return {
        title: title || 'Site Settings',
        subtitle: subtitle || 'Configure your site',
        media: media || undefined,
      };
    },
  },
});
