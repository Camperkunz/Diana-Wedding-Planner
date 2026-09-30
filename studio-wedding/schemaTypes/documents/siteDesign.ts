import { defineType, defineField } from 'sanity'

const color = (name: string, title: string, description: string, initialValue: string) =>
  defineField({
    name,
    title,
    type: 'color',
    fieldset: 'colors',
    description,
    initialValue: {
      _type: 'color',
      hex: initialValue,
    },
  })

export const siteDesign = defineType({
  name: 'siteDesign',
  title: 'Brand & Design',
  type: 'document',
  description: 'Control the visual identity of the website. The page layout itself stays fixed.',
  fieldsets: [
    { name: 'colors', title: 'Brand Colors', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    color('accent', 'Accent', 'Main brand color used for buttons, links and highlights.', '#941d3f'),
    color('foreground', 'Main Text Color', 'Primary text color.', '#26262a'),
    color('background', 'Page Background', 'Main page background.', '#f8f8f8'),
    color('secondary', 'Soft Background', 'Used for alternating sections and panels.', '#ececef'),
    color('mutedForeground', 'Muted Text', 'Secondary text such as descriptions and labels.', '#77777d'),
    color('accentOverlay', 'Accent Overlay', 'Accent tint used over photographs and decorative overlays.', '#b83d5f'),
    color('accentForeground', 'Text on Accent', 'Text color used on accent-colored buttons.', '#fffaf5'),
    color('border', 'Borders', 'Lines around cards, inputs and separators.', '#dedee2'),
  ],
  preview: { prepare: () => ({ title: 'Brand & Design', subtitle: 'Brand colors' }) },
})