import {defineType, defineField} from 'sanity'

const color = (name: string, title: string, description: string, initialValue: string) =>
  defineField({name, title, type: 'color', description, initialValue: {hex: initialValue}})

export const siteDesign = defineType({
  name: 'siteDesign',
  title: 'Brand & Design',
  type: 'document',
  description: 'Control the visual identity of the website. The page layout itself stays fixed.',
  fieldsets: [
    {name: 'colors', title: 'Brand Colors', options: {collapsible: true, collapsed: false}},
    {name: 'typography', title: 'Fonts', options: {collapsible: true, collapsed: false}},
  ],
  fields: [
    color('background', 'Page Background', 'Main page background.', '#f8f8f8'),
    color('foreground', 'Main Text', 'Primary text color.', '#26262a'),
    color('secondary', 'Soft Background', 'Used for alternating sections and panels.', '#ececef'),
    color('mutedForeground', 'Muted Text', 'Secondary text such as descriptions and labels.', '#77777d'),
    color('accent', 'Accent', 'Main brand color used for buttons, links and highlights.', '#941d3f'),
    color('accentOverlay', 'Accent Overlay', 'Accent tint used over photographs and decorative overlays.', '#b83d5f'),
    color('accentForeground', 'Text on Accent', 'Text color used on accent-colored buttons.', '#fffaf5'),
    color('border', 'Borders', 'Lines around cards, inputs and separators.', '#dedee2'),
    color('sage', 'Sage', 'Optional secondary brand tone.', '#969b91'),
    color('blush', 'Blush', 'Optional soft brand tone.', '#eadfe1'),
    color('sand', 'Sand', 'Optional neutral brand tone.', '#dedee2'),
    color('terracotta', 'Terracotta', 'Optional warm brand tone.', '#941d3f'),
    defineField({
      name: 'fontPreset',
      title: 'Font Style',
      type: 'string',
      fieldset: 'typography',
      description: 'Choose a complete font pairing. This changes headings, body text and script accents without changing the layout.',
      options: {
        list: [
          {title: 'Elegant — Jost + Cormorant + Dancing Script', value: 'elegant'},
          {title: 'Editorial — Manrope + Playfair Display + Allura', value: 'editorial'},
          {title: 'Romantic — Lato + DM Serif Display + Great Vibes', value: 'romantic'},
        ],
        layout: 'radio',
      },
      initialValue: 'elegant',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {prepare: () => ({title: 'Brand & Design', subtitle: 'Colors and typography'})},
})
