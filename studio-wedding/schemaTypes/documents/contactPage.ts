// schemas/contactPage.ts
import { defineType, defineField } from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  description: 'Edit the contact page copy, custom form fields, and success message.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'formSettings', title: '2. Form Settings & Email Recipient', options: { collapsible: true, collapsed: true } },
    { name: 'formFields', title: '3. Custom Form Fields Builder', options: { collapsible: true, collapsed: true } },
    { name: 'success', title: '4. Form Success Message', options: { collapsible: true, collapsed: true } },
    { name: 'contactInfo', title: '5. Contact Information', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    // Hero
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingLine1', title: 'Heading — First Part', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroHeadingScript', title: 'Heading — Script Word', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroImage', title: 'Background Photo', type: 'image', options: { hotspot: true }, fieldset: 'hero' }),
    defineField({ name: 'heroImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'hero' }),

    // Form Settings
    defineField({ name: 'formHeading', title: 'Heading', type: 'string', fieldset: 'formSettings' }),
    defineField({ name: 'formDescription', title: 'Description', type: 'text', rows: 4, fieldset: 'formSettings' }),
    defineField({
      name: 'recipientEmail',
      title: 'Form Submissions Recipient Email',
      description: 'The email address where submission notifications will be sent.',
      type: 'string',
      fieldset: 'formSettings'
    }),
    defineField({ name: 'submitLabel', title: 'Submit Button Label', type: 'string', fieldset: 'formSettings' }),

    // Dynamic Form Fields Builder
    defineField({
      name: 'customFields',
      title: 'Form Fields',
      description: 'Add and order the fields shown on the contact form.',
      type: 'array',
      fieldset: 'formFields',
      of: [
        {
          type: 'object',
          name: 'field',
          title: 'Field',
          fields: [
            defineField({ name: 'label', title: 'Field Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'placeholder', title: 'Placeholder Text', type: 'string' }),
            defineField({
              name: 'fieldType',
              title: 'Field Type',
              type: 'string',
              initialValue: 'text',
              options: {
                list: [
                  { title: 'Single Line Text', value: 'text' },
                  { title: 'Email Address', value: 'email' },
                  { title: 'Date Picker', value: 'date' },
                  { title: 'Multi-line Text (Textarea)', value: 'textarea' },
                  { title: 'Dropdown Select', value: 'select' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'options',
              title: 'Dropdown Options',
              description: 'Add list of options for user to select from (used when Field Type is Dropdown Select).',
              type: 'array',
              of: [{ type: 'string' }],
              hidden: ({ parent }) => parent?.fieldType !== 'select',
            }),
            defineField({ name: 'required', title: 'Is Required?', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'fieldType', required: 'required' },
            prepare({ title, subtitle, required }) {
              return {
                title: `${title || 'Untitled Field'} ${required ? '*' : ''}`,
                subtitle: subtitle ? subtitle.toUpperCase() : 'TEXT',
              }
            },
          },
        },
      ],
    }),

    // Success Message
    defineField({ name: 'successHeading', title: 'Success Heading', type: 'string', fieldset: 'success' }),
    defineField({ name: 'successDescription', title: 'Success Description', type: 'text', rows: 5, fieldset: 'success' }),
    defineField({ name: 'sendAnotherLabel', title: 'Send Another Message Label', type: 'string', fieldset: 'success' }),

    // Contact Info
    defineField({ name: 'contactInfoHeading', title: 'Contact Info Heading', type: 'string', fieldset: 'contactInfo' }),
    defineField({ name: 'contactEmailLabel', title: 'Email Label', type: 'string', fieldset: 'contactInfo' }),
    defineField({ name: 'contactPhoneLabel', title: 'Phone Label', type: 'string', fieldset: 'contactInfo' }),
    defineField({ name: 'contactLocationLabel', title: 'Location Label', type: 'string', fieldset: 'contactInfo' }),
    defineField({ name: 'instagramLabel', title: 'Instagram Label', type: 'string', fieldset: 'contactInfo' }),
    defineField({ name: 'instagramHandle', title: 'Instagram Handle', type: 'string', fieldset: 'contactInfo' }),
    defineField({ name: 'directReplyText', title: 'Direct Reply Note', type: 'text', rows: 3, fieldset: 'contactInfo' }),

    // SEO
    defineField({ name: 'seo', title: 'Search & Social Preview', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Contact Page', subtitle: 'Dynamic contact form & page content' }) },
})