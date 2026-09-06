import { defineType, defineField } from 'sanity';

export const siteFooter = defineType({
    name: 'siteFooter',
    title: 'Footer',
    type: 'document',
    // Singleton — hardcoded ID is managed in deskStructure.ts
    fields: [
        defineField({
            name: 'introText',
            title: 'Footer Intro Text',
            type: 'text',
            rows: 3,
            description:
                'The short paragraph shown under the logo in the footer, e.g. "Independent wedding planning, personally. Based in Ottawa, serving couples across Eastern Ontario and beyond."',
        }),
        defineField({
            name: 'footerNavLinks',
            title: 'Footer Navigation Links',
            type: 'array',
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
            description: 'Links shown in the "Explore" column of the footer. Drag to reorder.',
        }),
        defineField({
            name: 'copyrightText',
            title: 'Copyright Text',
            type: 'string',
            description:
                'The text at the very bottom of the page. The current year is added automatically before this text, e.g. entering "Diana Weddings. All rights reserved." shows "© 2026 Diana Weddings. All rights reserved."',
            initialValue: 'Diana Weddings. All rights reserved.',
        }),
        defineField({
            name: 'bottomLine',
            title: 'Bottom Line (small text)',
            type: 'string',
            description: 'Small text next to the copyright line, e.g. "Ottawa, Ontario · Canada".',
        }),
        defineField({
            name: 'footerEmail',
            title: 'Contact Email',
            type: 'string',
            description: 'The email address shown in the footer.',
        }),
        defineField({
            name: 'footerPhone',
            title: 'Contact Phone',
            type: 'string',
            description: 'The phone number shown in the footer.',
        }),
        defineField({
            name: 'footerServiceArea',
            title: 'Service Area',
            type: 'string',
            description: 'The area/location text shown in the footer, e.g. "Ottawa & Eastern Ontario".',
        }),
        defineField({
            name: 'footerSocialLinks',
            title: 'Footer Social Links Override',
            type: 'array',
            of: [{ type: 'socialLink' }],
            description:
                'Optional. Use different social links in the footer than the ones in Site Settings. Leave empty to use the defaults.',
        }),
    ],
    preview: {
        select: {
            title: 'copyrightText',
        },
        prepare({ title }: { title?: string }) {
            return {
                title: title ? `Footer — ${title}` : 'Footer',
                subtitle: 'Bottom-of-page settings',
            };
        },
    },
});