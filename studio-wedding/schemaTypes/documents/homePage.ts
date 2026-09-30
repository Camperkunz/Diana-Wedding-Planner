import { defineType, defineField } from 'sanity';
import { heroHeading } from '../objects/shared/heroHeading';

const imageField = (name: string, title: string, description?: string, fieldset?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    description,
    ...(fieldset ? { fieldset } : {}),
  });

const textField = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: 'text', rows: 4, description });

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page Content',
  type: 'document',
  description: 'Edit the words and photos used by the existing homepage design. The layout, sections and styling are fixed in the website code.',
  fieldsets: [
    { name: 'hero', title: '1. Hero', options: { collapsible: true, collapsed: true } },
    { name: 'about', title: '2. Meet Diana', options: { collapsible: true, collapsed: true } },
    { name: 'stats', title: '3. Stats', options: { collapsible: true, collapsed: true } },
    { name: 'services', title: '4. Services Preview', options: { collapsible: true, collapsed: true } },
    { name: 'quote', title: '5. Diana’s Quote', options: { collapsible: true, collapsed: true } },
    { name: 'portfolio', title: '6. Portfolio Preview', options: { collapsible: true, collapsed: true } },
    { name: 'approach', title: '7. My Approach', options: { collapsible: true, collapsed: true } },
    { name: 'testimonials', title: '8. Testimonials', options: { collapsible: true, collapsed: true } },
    { name: 'cta', title: '9. Final CTA', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'hero' }),
    heroHeading('heroHeading', 'Heading', 'hero'),
    defineField({ name: 'heroDescription', title: 'Description', type: 'text', rows: 4, fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'heroImage', title: 'Background Image', type: 'image', options: { hotspot: true }, fieldset: 'hero', description: 'The large hero photo. Recommended: 1920px wide or larger.', validation: (rule) => rule.required() }),
    defineField({ name: 'heroImageAlt', title: 'Image Alt Text', type: 'string', fieldset: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'heroPrimaryButtonLabel', title: 'Primary Button Label', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroPrimaryButtonLink', title: 'Primary Button Link', type: 'string', fieldset: 'hero', initialValue: '/contact' }),
    defineField({ name: 'heroSecondaryButtonLabel', title: 'Secondary Button Label', type: 'string', fieldset: 'hero' }),
    defineField({ name: 'heroSecondaryButtonLink', title: 'Secondary Button Link', type: 'string', fieldset: 'hero', initialValue: '/services' }),

    defineField({ name: 'aboutEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'about' }),
    defineField({ name: 'aboutHeading', title: 'Heading', type: 'string', fieldset: 'about', validation: (rule) => rule.required() }),
    defineField({
      name: 'aboutParagraphs',
      title: 'Paragraphs',
      type: 'array',
      fieldset: 'about',
      description: 'Each item becomes one paragraph in the “Meet Diana” section. Add, drag to reorder, or delete items — the page renders exactly the paragraphs you have here, in this order.',
      of: [{ type: 'text', rows: 5 }],
      validation: (rule) => rule.min(1),
    }),
    defineField({ name: 'aboutLinkLabel', title: 'Link Label', type: 'string', fieldset: 'about' }),
    defineField({ name: 'aboutLink', title: 'Link', type: 'string', fieldset: 'about', initialValue: '/about' }),
    defineField({ name: 'aboutImage1', title: 'Photo 1', type: 'image', options: { hotspot: true }, fieldset: 'about', description: 'Main (bigger) photo.', validation: (rule) => rule.required() }),
    defineField({ name: 'aboutImage2', title: 'Photo 2', type: 'image', options: { hotspot: true }, fieldset: 'about', description: 'Smaller photo.', validation: (rule) => rule.required() }),
    defineField({ name: 'aboutImage1Alt', title: 'Photo 1 Alt Text', type: 'string', fieldset: 'about', validation: (rule) => rule.required() }),
    defineField({ name: 'aboutImage2Alt', title: 'Photo 2 Alt Text', type: 'string', fieldset: 'about', validation: (rule) => rule.required() }),

    defineField({
      name: 'stats', title: 'Stats', type: 'array', fieldset: 'stats', validation: (rule) => rule.max(4),
      of: [{
        type: 'object', name: 'homeStat', fields: [
          defineField({ name: 'value', title: 'Value', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
        ]
      }],
    }),

    defineField({ name: 'servicesEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'services' }),
    defineField({ name: 'servicesHeading', title: 'Heading', type: 'string', fieldset: 'services', validation: (rule) => rule.required() }),
    defineField({ name: 'servicesDescription', title: 'Description', type: 'text', rows: 3, fieldset: 'services' }),
    defineField({ name: 'servicesButtonLabel', title: 'Button Label', type: 'string', fieldset: 'services' }),
    defineField({ name: 'servicesButtonLink', title: 'Button Link', type: 'string', fieldset: 'services', initialValue: '/services' }),
    defineField({ name: 'featuredServices', title: 'Services to Show', type: 'array', fieldset: 'services', of: [{ type: 'reference', to: [{ type: 'service' }] }], validation: (rule) => rule.max(3) }),

    defineField({ name: 'quoteImage', title: 'Background Image', type: 'image', fieldset: 'quote', options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: 'quoteImageAlt', title: 'Image Alt Text', type: 'string', fieldset: 'quote', validation: (rule) => rule.required() }),
    defineField({ name: 'quoteText', title: 'Quote', type: 'text', rows: 7, fieldset: 'quote', validation: (rule) => rule.required() }),
    defineField({ name: 'quoteAuthor', title: 'Author', type: 'string', fieldset: 'quote', validation: (rule) => rule.required() }),

    defineField({ name: 'portfolioEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'portfolio' }),
    defineField({ name: 'portfolioHeading', title: 'Heading', type: 'string', fieldset: 'portfolio', validation: (rule) => rule.required() }),
    defineField({ name: 'portfolioButtonLabel', title: 'Button Label', type: 'string', fieldset: 'portfolio' }),
    defineField({ name: 'portfolioButtonLink', title: 'Button Link', type: 'string', fieldset: 'portfolio', initialValue: '/portfolio' }),
    defineField({ name: 'featuredAlbums', title: 'Albums to Show', type: 'array', fieldset: 'portfolio', of: [{ type: 'reference', to: [{ type: 'album' }] }], validation: (rule) => rule.max(4) }),

    defineField({ name: 'approachEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'approach' }),
    defineField({ name: 'approachHeading', title: 'Heading', type: 'string', fieldset: 'approach', validation: (rule) => rule.required() }),
    defineField({ name: 'approachImage', title: 'Photo', type: 'image', fieldset: 'approach', options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: 'approachImageAlt', title: 'Photo Alt Text', type: 'string', fieldset: 'approach', validation: (rule) => rule.required() }),
    defineField({
      name: 'approachSteps', title: 'Steps', type: 'array', fieldset: 'approach', of: [{
        type: 'object', name: 'approachStep', fields: [
          defineField({ name: 'number', title: 'Number', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
        ]
      }], validation: (rule) => rule.max(6)
    }),

    defineField({ name: 'testimonialsEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'testimonials' }),
    defineField({ name: 'testimonialsHeading', title: 'Heading', type: 'string', fieldset: 'testimonials' }),
    defineField({ name: 'testimonialsSubtext', title: 'Intro Text', type: 'text', rows: 3, fieldset: 'testimonials' }),
    defineField({
      name: 'testimonials', title: 'Testimonials', type: 'array', fieldset: 'testimonials', description: 'Leave empty to hide the testimonials section on the homepage entirely.', of: [{
        type: 'object', name: 'homeTestimonial', fields: [
          defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 5, validation: (rule) => rule.required() }),
          defineField({ name: 'author', title: 'Author', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'weddingType', title: 'Wedding Type', type: 'string' }),
        ]
      }], validation: (rule) => rule.max(3)
    }),

    defineField({ name: 'ctaEyebrow', title: 'Eyebrow', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaHeading', title: 'Heading', type: 'string', fieldset: 'cta', description: 'Wrap a word in *asterisks* to give it the handwritten style — e.g. Let us *plan* your day.', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaDescription', title: 'Description', type: 'text', rows: 5, fieldset: 'cta', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaButtonLabel', title: 'Button Label', type: 'string', fieldset: 'cta' }),
    defineField({ name: 'ctaButtonLink', title: 'Button Link', type: 'string', fieldset: 'cta', initialValue: '/contact' }),
    defineField({ name: 'ctaDirectContactText', title: 'Direct Contact Line', type: 'string', fieldset: 'cta', description: 'Short text before the email address, e.g. “Or reach me directly at”.' }),
    defineField({ name: 'ctaImage', title: 'Background Image', type: 'image', fieldset: 'cta', options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: 'ctaImageAlt', title: 'Image Alt Text', type: 'string', fieldset: 'cta', validation: (rule) => rule.required() }),

    defineField({ name: 'seo', title: 'SEO Settings', type: 'seo', fieldset: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Home Page Content', subtitle: 'Fixed design · editable content only' }) },
});
