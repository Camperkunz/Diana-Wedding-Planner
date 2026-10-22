import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'backstageVideo',
    title: 'Backstage Video',
    type: 'document',

    fieldsets: [
        {
            name: 'videoDetails',
            title: 'Video Details',
            options: { collapsible: true, collapsed: false },
        },
        {
            name: 'display',
            title: 'Website Display',
            options: { collapsible: true, collapsed: true },
        },
    ],

    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            fieldset: 'videoDetails',
        }),

        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
            fieldset: 'videoDetails',
        }),

        defineField({
            name: 'videoUrl',
            title: 'Video Link',
            type: 'url',
            description:
                'A YouTube or Vimeo link: a watch page (https://www.youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID), ' +
                'a Shorts link, or an already-embedded URL (https://www.youtube.com/embed/VIDEO_ID, https://vimeo.com/123456789). ' +
                'Links this site cannot recognise are shown as a plain link to the video instead of a player.',
            validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
            fieldset: 'videoDetails',
        }),

        defineField({
            name: 'thumbnail',
            title: 'Thumbnail',
            type: 'image',
            description: 'Optional thumbnail image for the video. If not provided, the default thumbnail from the video URL will be used.',
            options: {
                hotspot: true,
            },
            fieldset: 'videoDetails',
        }),

        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Lower numbers appear first.',
            initialValue: 0,
            fieldset: 'display',
        }),

        defineField({
            name: 'isVisible',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
            fieldset: 'display',
        }),
    ],

    preview: {
        select: {
            title: 'title',
            subtitle: 'videoUrl',
            media: 'thumbnail',
        },
    },

    orderings: [
        {
            title: 'Website Order',
            name: 'orderAsc',
            by: [{ field: 'order', direction: 'asc' }],
        },
    ],
})