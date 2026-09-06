import { defineType, defineField } from 'sanity';

export const siteHeader = defineType({
    name: 'siteHeader',
    title: 'Header',
    type: 'document',
    // Singleton — hardcoded ID is managed in deskStructure.ts
    fields: [
        defineField({
            name: 'headerLogo',
            title: 'Header Logo Override',
            type: 'image',
            options: { hotspot: true },
            description:
                'Optional. Use a different logo in the header than the one in Site Settings. Leave empty to use the default (either the Site Settings logo, or the text name if no logo image is set anywhere).',
        }),
        defineField({
            name: 'navLinks',
            title: 'Navigation Links',
            type: 'array',
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
        defineField({
            name: 'ctaButtonLabel',
            title: 'Header Button Text',
            type: 'string',
            description: 'The text on the highlighted button in the top navigation bar, e.g. "Contact".',
            initialValue: 'Contact',
        }),
        defineField({
            name: 'ctaButtonLink',
            title: 'Header Button Link',
            type: 'string',
            description: 'Where the highlighted header button goes, e.g. "/contact".',
            initialValue: '/contact',
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'Header',
                subtitle: 'Top navigation bar settings',
            };
        },
    },
});