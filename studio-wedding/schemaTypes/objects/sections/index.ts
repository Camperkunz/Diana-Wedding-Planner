import { defineType, defineField } from 'sanity';
import type { Rule } from 'sanity';

export const sections = defineType({
  name: 'sections',
  title: 'Page Sections',
  type: 'array',
  of: [
    { type: 'heroSection' },
    { type: 'aboutSection' },
    { type: 'galleryPreviewSection' },
    { type: 'testimonialsSection' },
    { type: 'ctaSection' },
    { type: 'contactSection' },
  ],
  description: 'Add, remove, and reorder the sections that make up this page.',
  validation: (rule: Rule) =>
    rule
      .unique()
      .warning('Duplicate sections are allowed but may look repetitive on the page.'),
});
