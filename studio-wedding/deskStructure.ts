import { structureTool } from 'sanity/structure';

// Hardcoded singleton document IDs — must match the `name` in each singleton schema
const SINGLETONS = {
  siteSettings: 'siteSettings',
  siteLayout: 'siteLayout',
  homePage: 'homePage',
} as const;

export const deskStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // ── Site Settings (singleton) ──
      S.listItem()
        .id('site-settings')
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId(SINGLETONS.siteSettings)
            .title('Site Settings')
        ),

      // ── Header & Footer (singleton) ──
      S.listItem()
        .id('site-layout')
        .title('Header & Footer')
        .child(
          S.document()
            .schemaType('siteLayout')
            .documentId(SINGLETONS.siteLayout)
            .title('Header & Footer')
        ),

      // ── Home Page (singleton) ──
      S.listItem()
        .id('home-page')
        .title('Home Page')
        .child(
          S.document()
            .schemaType('homePage')
            .documentId(SINGLETONS.homePage)
            .title('Home Page')
        ),

      S.divider(),

      // ── Pages (list) ──
      S.listItem()
        .id('pages')
        .title('Pages')
        .schemaType('page')
        .child(
          S.documentTypeList('page').title('Pages')
        ),

      // ── Albums (portfolio list) ──
      S.listItem()
        .id('albums')
        .title('Albums')
        .schemaType('album')
        .child(
          S.documentTypeList('album').title('Albums')
        ),
    ]);
