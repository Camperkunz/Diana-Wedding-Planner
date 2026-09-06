const SINGLETONS = {
  siteSettings: 'siteSettings',
  siteLayout: 'siteLayout',
  siteDesign: 'siteDesign',
  homePage: 'homePage',
  aboutPage: 'aboutPage',
  servicesPage: 'servicesPage',
  portfolioPage: 'portfolioPage',
  faqPage: 'faqPage',
  backstagePage: 'backstagePage',
  contactPage: 'contactPage',
} as const

const singleton = (S: any, id: string, schemaType: string, title: string) =>
  S.listItem().id(id).title(title).child(
    S.document().schemaType(schemaType).documentId(id).title(title)
  )

export const deskStructure = (S: any) =>
  S.list().title('Website Content').items([
    S.listItem().id('website').title('Website').child(S.list().title('Website').items([
      singleton(S, SINGLETONS.homePage, 'homePage', 'Home Page'),
      singleton(S, SINGLETONS.aboutPage, 'aboutPage', 'About Page'),
      singleton(S, SINGLETONS.servicesPage, 'servicesPage', 'Services Page'),
      singleton(S, SINGLETONS.portfolioPage, 'portfolioPage', 'Portfolio Page'),
      singleton(S, SINGLETONS.faqPage, 'faqPage', 'FAQ Page'),
      singleton(S, SINGLETONS.backstagePage, 'backstagePage', 'Backstage Page'),
      singleton(S, SINGLETONS.contactPage, 'contactPage', 'Contact Page'),
    ])),

    S.divider(),

    S.listItem().id('brand').title('Brand & Design').child(S.list().title('Brand & Design').items([
      singleton(S, SINGLETONS.siteSettings, 'siteSettings', 'Business & Contact'),
      singleton(S, SINGLETONS.siteDesign, 'siteDesign', 'Colors & Fonts'),
      singleton(S, SINGLETONS.siteLayout, 'siteLayout', 'Header & Footer'),
    ])),

    S.divider(),

    S.listItem().id('services').title('Services').schemaType('service').child(S.documentTypeList('service').title('Services')),
    S.listItem().id('albums').title('Wedding Albums').schemaType('album').child(S.documentTypeList('album').title('Wedding Albums')),
    S.listItem().id('backstageVideos').title('Backstage Videos').schemaType('backstageVideo').child(S.documentTypeList('backstageVideo').title('Backstage Videos')),
  ])
