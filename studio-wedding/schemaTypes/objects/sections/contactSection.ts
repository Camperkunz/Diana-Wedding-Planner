import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact',
  type: 'object',
  fields: [
    defineField({
      name: 'sectionLabel',
      title: 'Admin Label',
      type: 'string',
      description: 'A short name to help you identify this section in the list. Only visible to you, not on the website.',
      initialValue: 'Contact',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section title, e.g. "Let\'s talk".',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 3,
      description: 'Supporting text below the heading.',
    }),
    defineField({
      name: 'overrideContactInfo',
      title: 'Use Custom Contact Info',
      type: 'boolean',
      description: 'Turn on to show different contact details than the ones in Header & Footer. Leave off to inherit.',
      initialValue: false,
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Only used if "Use Custom Contact Info" is turned on.',
      hidden: ({ parent }: { parent: any }) => !parent?.overrideContactInfo,
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'Only used if "Use Custom Contact Info" is turned on.',
      hidden: ({ parent }: { parent: any }) => !parent?.overrideContactInfo,
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      description: 'Only used if "Use Custom Contact Info" is turned on.',
      hidden: ({ parent }: { parent: any }) => !parent?.overrideContactInfo,
    }),
    defineField({
      name: 'showForm',
      title: 'Show Contact Form',
      type: 'boolean',
      description: 'Turn on to display a contact form on this section.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'sectionLabel',
      subtitle: 'heading',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || 'Contact',
        subtitle: subtitle || 'Contact section',
      };
    },
  },
});
