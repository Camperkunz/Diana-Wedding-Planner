const SINGLETON_IDS = {
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
  S.listItem()
    .id(id)
    .title(title)
    .child(
      S.document()
        .schemaType(schemaType)
        .documentId(id)
        .title(title)
    )

export const deskStructure = (S: any) =>
  S.list()
    .title('Website Content')
    .items([
      S.listItem()
        .id('website')
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              singleton(S, SINGLETON_IDS.homePage, 'homePage', 'Home Page'),
              singleton(S, SINGLETON_IDS.aboutPage, 'aboutPage', 'About Page'),
              singleton(S, SINGLETON_IDS.servicesPage, 'servicesPage', 'Services Page'),
              singleton(S, SINGLETON_IDS.portfolioPage, 'portfolioPage', 'Portfolio Page'),
              singleton(S, SINGLETON_IDS.faqPage, 'faqPage', 'FAQ Page'),
              singleton(S, SINGLETON_IDS.backstagePage, 'backstagePage', 'Backstage Page'),
              singleton(S, SINGLETON_IDS.contactPage, 'contactPage', 'Contact Page'),
            ])
        ),

      S.divider(),

      S.listItem()
        .id('brand')
        .title('Brand & Settings')
        .child(
          S.list()
            .title('Brand & Settings')
            .items([
              singleton(S, SINGLETON_IDS.siteSettings, 'siteSettings', 'Business & Contact Info'),
              singleton(S, SINGLETON_IDS.siteDesign, 'siteDesign', 'Colors & Fonts'),
              singleton(S, SINGLETON_IDS.siteLayout, 'siteLayout', 'Header & Footer Menu'),
            ])
        ),

      S.divider(),

      S.listItem()
        .id('services')
        .title('Services')
        .schemaType('service')
        .child(S.documentTypeList('service').title('Services')),
      S.listItem()
        .id('albums')
        .title('Wedding Albums')
        .schemaType('album')
        .child(S.documentTypeList('album').title('Wedding Albums')),
      S.listItem()
        .id('backstageVideos')
        .title('Backstage Videos')
        .schemaType('backstageVideo')
        .child(S.documentTypeList('backstageVideo').title('Backstage Videos')),
    ])