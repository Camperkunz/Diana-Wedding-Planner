import { defineType, defineField } from 'sanity';

export const album = defineType({
  name: 'album',
  title: 'Album',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Album Title',
      type: 'string',
      description: 'The name of this wedding album, e.g. "Marguerite & James".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Album URL',
      type: 'slug',
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
      description: 'A short description of the cover image for screen readers, e.g. "Outdoor ceremony with white canopy and florals".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'A brief summary shown in the portfolio grid and at the top of the album page.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
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
      description: 'Lower numbers appear first in the portfolio grid. Use 1, 2, 3, etc.',
      initialValue: 1,
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
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
              validation: (rule) => rule.required(),
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
