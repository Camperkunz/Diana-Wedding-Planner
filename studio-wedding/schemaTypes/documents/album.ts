import {defineType, defineField} from 'sanity';
import {BulkPhotosInput} from '../../components/BulkPhotosInput';

export const album = defineType({
  name: 'album',
  title: 'Wedding Album',
  type: 'document',
  description:
    'A wedding story in Diana’s portfolio. Enter the title, drop in the photos — that is the minimum. Everything else is optional.',
  fieldsets: [
    { name: 'identity', title: 'Wedding Details', options: { collapsible: true, collapsed: false } },
    { name: 'gallery', title: 'Gallery Photos', options: { collapsible: true, collapsed: false } },
    { name: 'cover', title: 'Cover Photo', options: { collapsible: true, collapsed: true } },
    { name: 'story', title: 'Story', options: { collapsible: true, collapsed: true } },
    { name: 'optional', title: 'Optional Details', options: { collapsible: true, collapsed: true } },
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
      name: 'category',
      title: 'Category',
      type: 'string',
      fieldset: 'identity',
      description:
        'A free-text label for the wedding type shown above the title, e.g. "Garden Wedding", "Ballroom Reception" or "Intimate Elopement". Type anything you like.',
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      fieldset: 'gallery',
      components: { input: BulkPhotosInput },
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
          ],
        },
      ],
      description:
        'Drag & drop as many photos as you like, or use the button to select files — they are all added at once. The first photo becomes the album cover. Drag the thumbnails to reorder.',
      validation: (rule) =>
        rule.min(1).warning('Publishing without photos leaves the album page empty.'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image (override)',
      type: 'image',
      fieldset: 'cover',
      options: {
        hotspot: true,
      },
      description:
        'Optional — when left empty, the first gallery photo is used as the cover automatically. Only set this to pick a different photo.',
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Cover Image Alt Text',
      type: 'string',
      fieldset: 'cover',
      description: 'A short description of the cover image for screen readers, e.g. "Outdoor ceremony with white canopy and florals".',
    }),
    defineField({
      name: 'story',
      title: 'Story',
      type: 'text',
      fieldset: 'story',
      rows: 6,
      description:
        'The description shown at the top of the album page. Leave empty to skip it — the page will show only the photos.',
    }),
    defineField({
      name: 'date',
      title: 'Wedding Date / Label',
      type: 'string',
      fieldset: 'optional',
      description:
        'Optional, e.g. "September 2025". Leave empty when it is not relevant — nothing is shown then.',
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      fieldset: 'optional',
      description: 'Optional. Leave empty when there is no venue to name.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      fieldset: 'optional',
      description: 'Optional, e.g. "Ottawa, Canada". Leave empty when unknown.',
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
