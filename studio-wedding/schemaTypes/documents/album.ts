import { defineType, defineField } from 'sanity';

export const album = defineType({
  name: 'album',
  title: 'Wedding Album',
  type: 'document',
  description: 'A wedding story in Diana’s portfolio. The album page layout is fixed; you control the story and photos.',
  fieldsets: [
    { name: 'identity', title: 'Wedding Details', options: { collapsible: true, collapsed: false } },
    { name: 'story', title: 'Story', options: { collapsible: true, collapsed: false } },
    { name: 'cover', title: 'Cover Photo', options: { collapsible: true, collapsed: true } },
    { name: 'gallery', title: 'Gallery Photos', options: { collapsible: true, collapsed: false } },
    { name: 'display', title: 'Portfolio Display', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Album Title',
      type: 'string',
      fieldset: 'identity',
      description: 'The name of this wedding album, e.g. "Marguerite & James".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Album URL',
      type: 'slug',
      fieldset: 'identity',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'The web address for this album. Click "Generate" to create it from the title.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      fieldset: 'cover',
      options: {
        hotspot: true,
      },
      description: 'The main photo shown for this album in the portfolio grid. Recommended size: at least 940×650 pixels.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Cover Image Alt Text',
      type: 'string',
      fieldset: 'cover',
      description: 'A short description of the cover image for screen readers, e.g. "Outdoor ceremony with white canopy and florals".',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      fieldset: 'story',
      rows: 3,
      description: 'A brief summary shown in the portfolio grid and at the top of the album page.',
    }),
    defineField({
      name: 'story',
      title: 'Story',
      type: 'text',
      fieldset: 'story',
      rows: 6,
      description: 'The longer story shown on the individual album page.',
    }),
    defineField({
      name: 'date',
      title: 'Wedding Date / Label',
      type: 'string',
      fieldset: 'identity',
      description: 'Optional date or date label shown on the album page, e.g. September 2025.',
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      fieldset: 'identity',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      fieldset: 'identity',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      fieldset: 'identity',
      description: 'A label for the wedding type, e.g. "Garden Wedding" or "Ballroom Reception".',
      options: {
        list: [
          { title: 'Garden Wedding', value: 'Garden Wedding' },
          { title: 'Ballroom Reception', value: 'Ballroom Reception' },
          { title: 'Rustic Barn Wedding', value: 'Rustic Barn Wedding' },
          { title: 'Intimate Elopement', value: 'Intimate Elopement' },
          { title: 'Modern Hotel Wedding', value: 'Modern Hotel Wedding' },
          { title: 'Cultural Fusion Wedding', value: 'Cultural Fusion Wedding' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      fieldset: 'display',
      description: 'Lower numbers appear first in the portfolio grid. Use 1, 2, 3, etc.',
      initialValue: 1,
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      fieldset: 'gallery',
      of: [
        {
          type: 'object',
          name: 'albumPhoto',
          title: 'Photo',
          fields: [
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: {
                hotspot: true,
              },
              description: 'Upload or select a photo for this album.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'A short description of the photo for screen readers, e.g. "Bride and groom kissing at the ceremony".',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'An optional caption shown with the photo, e.g. "The first kiss as a married couple".',
            }),
          ],
          preview: {
            select: {
              title: 'alt',
              subtitle: 'caption',
              media: 'image',
            },
            prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
              return {
                title: title || 'Untitled Photo',
                subtitle: subtitle || 'No caption',
                media: media || undefined,
              };
            },
          },
        },
      ],
      description: 'The photos in this album. Drag to reorder. Each photo needs an image and alt text.',
    }),
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'coverImage',
    },
    prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
      return {
        title: title || 'Untitled Album',
        subtitle: subtitle || 'No category set',
        media: media || undefined,
      };
    },
  },
});
