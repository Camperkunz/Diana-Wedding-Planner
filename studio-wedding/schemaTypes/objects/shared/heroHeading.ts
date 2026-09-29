import { defineField } from 'sanity'

/**
 * The one-line hero heading, shared by every page so each page keeps the exact same
 * editing experience inside its own `1. Hero` fieldset.
 *
 * Wrap any word in *asterisks* to switch it to the handwritten script font, for example
 * `Diana *plans* your wedding`. A plain single-line string keeps the editor minimal: no
 * toolbar, no extra blocks, and the same field fits any sentence and any line count —
 * the website wraps the words itself.
 */
export const heroHeading = (name: string, title: string, fieldset: string) =>
  defineField({
    name,
    title,
    type: 'string',
    fieldset,
    description:
      'Wrap a word in *asterisks* to give it the handwritten style — e.g. Diana *plans* your wedding.',
    validation: (rule) => rule.required(),
  })
