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
            validation: (Rule) => Rule.required(),
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
            title: 'YouTube Embed URL',
            type: 'url',
            description:
                'Example: https://www.youtube.com/embed/VIDEO_ID or any other embeddable video URL.',
            validation: (Rule) => Rule.required(),
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