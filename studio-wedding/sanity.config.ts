import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { colorInput } from '@sanity/color-input'
import { schemaTypes } from './schemaTypes'
import { deskStructure } from './deskStructure'

const projectId = 'zwrr14ct'
const dataset = 'production'

const SINGLETON_TYPES = [
  'siteSettings',
  'siteLayout',
  'siteDesign',
  'homePage',
  'aboutPage',
  'servicesPage',
  'portfolioPage',
  'faqPage',
  'backstagePage',
  'contactPage',
  'privacyPolicy',
]

export default defineConfig({
  name: 'default',
  title: 'Diana Voloshina — Content Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    colorInput(),
    ...(process.env.NODE_ENV === 'development' ? [visionTool()] : []),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Singletons: hide them from the global "Create" menu so a duplicate
    // (random _id) can never be created.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter((option) => !SINGLETON_TYPES.includes(option.templateId))
        : prev,
    // ...and remove actions that could delete or clone them.
    actions: (prev, {schemaType}) =>
      SINGLETON_TYPES.includes(schemaType)
        ? prev.filter(
            ({action}) => !['unpublish', 'delete', 'duplicate'].includes(action ?? ''),
          )
        : prev,
  },
})