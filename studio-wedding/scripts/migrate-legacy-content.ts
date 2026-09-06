import {getCliClient} from 'sanity/cli'
import {readFileSync, writeFileSync, existsSync} from 'node:fs'

const client = getCliClient({apiVersion: '2026-05-15'})
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function uploadImage(url: string | undefined, filename: string, state: Record<string, string>) {
  if (!url) return undefined
  if (state[url]) return {_type: 'reference', _ref: state[url]}

  console.log(`  ↓ Downloading image: ${url}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status} ${response.statusText}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename})
  state[url] = asset._id
  console.log(`  ✓ Uploaded: ${asset._id}`)
  await sleep(150)
  return {_type: 'reference', _ref: asset._id}
}

function slug(value: string) {
  return {_type: 'slug', current: value}
}

function docId(type: string, value: string) {
  return `${type}-${value}`
}

async function upsert(_id: string, _type: string, fields: Record<string, unknown>) {
  await client.createOrReplace({_id, _type, ...fields})
  console.log(`✓ ${_type}: ${_id}`)
}

async function main() {
  console.log('Starting Diana Wedding Planner content migration...')
  console.log('This migration creates/updates content only. It does not change page layout or styling.')

  const contentPath = new URL('./legacy-content.json', import.meta.url)
  const statePath = new URL('./migration-state.json', import.meta.url)
  const legacy = JSON.parse(readFileSync(contentPath, 'utf8')) as any
  const assetMap: Record<string, string> = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')).assetMap || {} : {}

  // ─────────────────────────────────────────────
  // Site Settings
  // ─────────────────────────────────────────────
  const s = legacy.data.getSiteSettings
  await upsert('siteSettings', 'siteSettings', {
    siteTitle: s.name,
    tagline: s.tagline,
    location: s.location,
    serviceArea: s.serviceArea,
    email: s.email,
    phone: s.phone,
    socialLinks: [
      {_key: 'instagram', _type: 'socialLink', platform: 'instagram', url: s.instagramUrl},
      {_key: 'pinterest', _type: 'socialLink', platform: 'pinterest', url: s.pinterestUrl},
    ],
    seo: {
      _type: 'seo',
      metaTitle: 'Diana — Wedding Planner in Ottawa | Personal, Hands-On Wedding Planning',
      metaDescription: 'Independent, personal wedding planning in Ottawa.',
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // Brand & Design — preserve the current visual identity
  // ─────────────────────────────────────────────
  await upsert('siteDesign', 'siteDesign', {
    background: {_type: 'color', hex: '#f8f8f8'},
    foreground: {_type: 'color', hex: '#26262a'},
    secondary: {_type: 'color', hex: '#ececef'},
    mutedForeground: {_type: 'color', hex: '#77777d'},
    accent: {_type: 'color', hex: '#941d3f'},
    accentOverlay: {_type: 'color', hex: '#b83d5f'},
    accentForeground: {_type: 'color', hex: '#fffaf5'},
    border: {_type: 'color', hex: '#dedee2'},
    sage: {_type: 'color', hex: '#969b91'},
    blush: {_type: 'color', hex: '#eadfe1'},
    sand: {_type: 'color', hex: '#dedee2'},
    terracotta: {_type: 'color', hex: '#941d3f'},
    fontPreset: 'elegant',
  })

  // ─────────────────────────────────────────────
  // Header / Footer
  // ─────────────────────────────────────────────
  await upsert('siteLayout', 'siteLayout', {
    navLinks: [
      {_key: 'about', _type: 'navLink', label: 'About', link: '/about', order: 1},
      {_key: 'services', _type: 'navLink', label: 'Services', link: '/services', order: 2},
      {_key: 'portfolio', _type: 'navLink', label: 'Portfolio', link: '/portfolio', order: 3},
      {_key: 'backstage', _type: 'navLink', label: 'Backstage', link: '/backstage', order: 4},
      {_key: 'faq', _type: 'navLink', label: 'FAQ', link: '/faq', order: 5},
      {_key: 'contact', _type: 'navLink', label: 'Contact', link: '/contact', order: 6},
    ],
    footerNavLinks: [
      {_key: 'about', _type: 'navLink', label: 'About', link: '/about'},
      {_key: 'services', _type: 'navLink', label: 'Services', link: '/services'},
      {_key: 'portfolio', _type: 'navLink', label: 'Portfolio', link: '/portfolio'},
      {_key: 'backstage', _type: 'navLink', label: 'Backstage', link: '/backstage'},
      {_key: 'faq', _type: 'navLink', label: 'FAQ', link: '/faq'},
      {_key: 'contact', _type: 'navLink', label: 'Contact', link: '/contact'},
    ],
    footerExploreLabel: 'Explore',
    footerContactLabel: 'Get in Touch',
    copyrightText: '© 2026 Diana Voloshina. All rights reserved.',
    footerDescription: 'Independent wedding planning in Ottawa — personally involved from first consultation to final toast.',
  })

  // ─────────────────────────────────────────────
  // Services
  // ─────────────────────────────────────────────
  for (let i = 0; i < legacy.data.getServices.length; i++) {
    const service = legacy.data.getServices[i]
    await upsert(docId('service', service.slug), 'service', {
      name: service.name,
      slug: slug(service.slug),
      startingPrice: service.startingPrice,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      includes: service.includes,
      image: await uploadImage(service.image, `${service.slug}.jpg`, assetMap),
      imageAlt: service.imageAlt,
      featured: service.featured,
      order: i + 1,
    })
  }

  // ─────────────────────────────────────────────
  // Wedding Albums + gallery images
  // ─────────────────────────────────────────────
  const albumRefs: Record<string, {_type: 'reference'; _ref: string}> = {}
  for (let i = 0; i < legacy.data.getAlbums.length; i++) {
    const album = legacy.data.getAlbums[i]
    const cover = await uploadImage(album.coverImage, `${album.slug}-cover.jpg`, assetMap)
    const photos = []
    for (let j = 0; j < album.photos.length; j++) {
      const photo = album.photos[j]
      photos.push({
        _key: `photo-${j + 1}`,
        _type: 'albumPhoto',
        image: await uploadImage(photo.src, `${album.slug}-${j + 1}.jpg`, assetMap),
        alt: photo.alt,
        caption: photo.caption,
      })
    }

    const id = docId('album', album.slug)
    await upsert(id, 'album', {
      title: album.title,
      slug: slug(album.slug),
      category: album.category,
      shortDescription: album.story,
      story: album.story,
      date: album.date,
      venue: album.venue,
      location: album.location,
      coverImage: cover,
      coverImageAlt: album.coverImageAlt,
      photos,
      order: i + 1,
      seo: {
        _type: 'seo',
        metaTitle: `${album.title} — Wedding Portfolio | Diana Weddings`,
        metaDescription: album.story.slice(0, 160),
        noIndex: false,
        noFollow: false,
      },
    })
    albumRefs[album.slug] = {_type: 'reference', _ref: id}
  }

  const serviceRefs = legacy.data.getServices.map((s: any) => ({_type: 'reference', _ref: docId('service', s.slug)}))
  const featuredAlbumRefs = legacy.data.getAlbums.filter((a: any) => a.featured).map((a: any) => albumRefs[a.slug])

  // ─────────────────────────────────────────────
  // Home Page
  // ─────────────────────────────────────────────
  const h = legacy.home
  await upsert('homePage', 'homePage', {
    heroEyebrow: h.heroEyebrow,
    heroHeadingLine1: h.heroHeadingLine1,
    heroHeadingScript: h.heroHeadingScript,
    heroHeadingLine2: h.heroHeadingLine2,
    heroDescription: h.heroDescription,
    heroImage: await uploadImage(h.heroImage, 'home-hero.jpg', assetMap),
    heroImageAlt: h.heroImageAlt,
    heroPrimaryButtonLabel: h.heroPrimaryButtonLabel,
    heroPrimaryButtonLink: h.heroPrimaryButtonLink,
    heroSecondaryButtonLabel: h.heroSecondaryButtonLabel,
    heroSecondaryButtonLink: h.heroSecondaryButtonLink,
    aboutEyebrow: h.aboutEyebrow,
    aboutHeading: h.aboutHeading,
    aboutParagraph1: h.aboutParagraph1,
    aboutParagraph2: h.aboutParagraph2,
    aboutLinkLabel: h.aboutLinkLabel,
    aboutLink: h.aboutLink,
    aboutImage1: await uploadImage(h.aboutImage1, 'home-about-1.jpg', assetMap),
    aboutImage2: await uploadImage(h.aboutImage2, 'home-about-2.jpg', assetMap),
    aboutImage1Alt: h.aboutImage1Alt,
    aboutImage2Alt: h.aboutImage2Alt,
    stats: h.stats.map((x: any, i: number) => ({_key: `stat-${i + 1}`, _type: 'homeStat', ...x})),
    servicesEyebrow: h.servicesEyebrow,
    servicesHeading: h.servicesHeading,
    servicesDescription: h.servicesDescription,
    servicesButtonLabel: h.servicesButtonLabel,
    servicesButtonLink: h.servicesButtonLink,
    featuredServices: serviceRefs,
    quoteImage: await uploadImage(h.quoteImage, 'home-quote.jpg', assetMap),
    quoteImageAlt: h.quoteImageAlt,
    quoteText: h.quoteText,
    quoteAuthor: h.quoteAuthor,
    portfolioEyebrow: h.portfolioEyebrow,
    portfolioHeading: h.portfolioHeading,
    portfolioButtonLabel: h.portfolioButtonLabel,
    portfolioButtonLink: h.portfolioButtonLink,
    featuredAlbums: featuredAlbumRefs,
    approachEyebrow: h.approachEyebrow,
    approachHeading: h.approachHeading,
    approachImage: await uploadImage(h.approachImage, 'home-approach.jpg', assetMap),
    approachImageAlt: h.approachImageAlt,
    approachSteps: legacy.data.getProcessSteps.map((x: any, i: number) => ({_key: `step-${i + 1}`, _type: 'approachStep', ...x})),
    testimonialsEyebrow: h.testimonialsEyebrow,
    testimonialsHeading: h.testimonialsHeading,
    testimonialsSubtext: h.testimonialsSubtext,
    testimonials: legacy.data.getTestimonials.map((x: any, i: number) => ({_key: `testimonial-${i + 1}`, _type: 'homeTestimonial', quote: x.quote, author: x.author, weddingType: x.weddingType})),
    ctaEyebrow: h.ctaEyebrow,
    ctaHeadingLine1: h.ctaHeadingLine1,
    ctaHeadingLine2: h.ctaHeadingLine2,
    ctaHeadingScript: h.ctaHeadingScript,
    ctaDescription: h.ctaDescription,
    ctaButtonLabel: h.ctaButtonLabel,
    ctaButtonLink: h.ctaButtonLink,
    ctaDirectContactText: h.ctaDirectContactText,
    ctaImage: await uploadImage(h.ctaImage, 'home-cta.jpg', assetMap),
    ctaImageAlt: h.ctaImageAlt,
    seo: {
      _type: 'seo',
      metaTitle: 'Diana — Wedding Planner in Ottawa | Personal, Hands-On Wedding Planning',
      metaDescription: 'Independent, personal wedding planning in Ottawa. Diana works directly with a limited number of couples from first consultation to final toast.',
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // About Page
  // ─────────────────────────────────────────────
  const a = legacy.about
  await upsert('aboutPage', 'aboutPage', {
    heroEyebrow: a.heroEyebrow,
    heroHeadingLine1: a.heroHeadingLine1,
    heroHeadingScript: a.heroHeadingScript,
    heroImage: await uploadImage(a.heroImage, 'about-hero.jpg', assetMap),
    heroImageAlt: a.heroImageAlt,
    storyEyebrow: a.storyEyebrow,
    storyHeading: a.storyHeading,
    storyParagraphs: a.storyParagraphs,
    storyImage: await uploadImage(a.storyImage, 'about-story.jpg', assetMap),
    storyImageAlt: a.storyImageAlt,
    glanceEyebrow: a.glanceEyebrow,
    glanceItems: a.glanceItems.map((x: any, i: number) => ({_key: `glance-${i + 1}`, _type: 'glanceItem', ...x})),
    philosophyEyebrow: a.philosophyEyebrow,
    philosophyHeading: a.philosophyHeading,
    philosophyItems: a.philosophyItems.map((x: any, i: number) => ({_key: `philosophy-${i + 1}`, _type: 'philosophyItem', ...x})),
    stats: legacy.data.getStats.map((x: any, i: number) => ({_key: `stat-${i + 1}`, _type: 'aboutStat', ...x})),
    testimonialsEyebrow: a.testimonialsEyebrow,
    testimonialsHeading: a.testimonialsHeading,
    testimonialsIntro: a.testimonialsIntro,
    testimonials: legacy.data.getTestimonials.map((x: any, i: number) => ({_key: `testimonial-${i + 1}`, _type: 'aboutTestimonial', quote: x.quote, author: x.author, weddingType: x.weddingType})),
    ctaHeading: a.ctaHeading,
    ctaDescription: a.ctaDescription,
    ctaButtonLabel: a.ctaButtonLabel,
    ctaButtonLink: a.ctaButtonLink,
    seo: {
      _type: 'seo',
      metaTitle: 'About Diana — Ottawa Wedding Planner',
      metaDescription: 'Meet Diana, an independent wedding planner based in Ottawa.',
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // Services Page
  // ─────────────────────────────────────────────
  const sp = legacy.services
  await upsert('servicesPage', 'servicesPage', {
    heroEyebrow: sp.heroEyebrow,
    heroHeadingLine1: sp.heroHeadingLine1,
    heroHeadingScript: sp.heroHeadingScript,
    heroHeadingLine2: sp.heroHeadingLine2,
    heroImage: await uploadImage(sp.heroImage, 'services-hero.jpg', assetMap),
    heroImageAlt: sp.heroImageAlt,
    overviewEyebrow: sp.overviewEyebrow,
    overviewHeading: sp.overviewHeading,
    overviewDescription: sp.overviewDescription,
    comparisonEyebrow: sp.comparisonEyebrow,
    comparisonHeading: sp.comparisonHeading,
    comparisonRows: sp.comparisonRows.map((x: any, i: number) => ({_key: `row-${i + 1}`, _type: 'comparisonRow', ...x})),
    ctaHeading: sp.ctaHeading,
    ctaDescription: sp.ctaDescription,
    ctaButtonLabel: sp.ctaButtonLabel,
    ctaButtonLink: sp.ctaButtonLink,
    seo: {
      _type: 'seo',
      metaTitle: 'Services — Wedding Planning with Diana | Ottawa',
      metaDescription: sp.overviewDescription,
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // Portfolio Page
  // ─────────────────────────────────────────────
  const pp = legacy.portfolio
  await upsert('portfolioPage', 'portfolioPage', {
    heroEyebrow: pp.heroEyebrow,
    heroHeadingScript: pp.heroHeadingScript,
    heroHeadingRest: pp.heroHeadingRest,
    heroImage: await uploadImage(pp.heroImage, 'portfolio-hero.jpg', assetMap),
    heroImageAlt: pp.heroImageAlt,
    introText: pp.introText,
    ctaHeading: pp.ctaHeading,
    ctaButtonLabel: pp.ctaButtonLabel,
    ctaButtonLink: pp.ctaButtonLink,
    seo: {
      _type: 'seo',
      metaTitle: "Portfolio — Weddings Planned by Diana | Ottawa",
      metaDescription: pp.introText,
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // FAQ Page
  // ─────────────────────────────────────────────
  const fp = legacy.faq
  await upsert('faqPage', 'faqPage', {
    heroEyebrow: fp.heroEyebrow,
    heroHeadingLine1: fp.heroHeadingLine1,
    heroHeadingScript: fp.heroHeadingScript,
    heroImage: await uploadImage(fp.heroImage, 'faq-hero.jpg', assetMap),
    heroImageAlt: fp.heroImageAlt,
    items: legacy.data.getFaqItems.map((x: any, i: number) => ({_key: x.id || `faq-${i + 1}`, _type: 'faqItem', ...x})),
    contactHeading: fp.contactHeading,
    contactDescription: fp.contactDescription,
    contactButtonLabel: fp.contactButtonLabel,
    contactButtonLink: fp.contactButtonLink,
    seo: {
      _type: 'seo',
      metaTitle: 'FAQ — Common Questions | Diana, Ottawa Wedding Planner',
      metaDescription: 'Answers to the questions couples ask most often about working with Diana — service levels, pricing, process, and more.',
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // Backstage Page
  // ─────────────────────────────────────────────
  const bp = legacy.backstage
  await upsert('backstagePage', 'backstagePage', {
    heroEyebrow: bp.heroEyebrow,
    heroHeadingLine1: bp.heroHeadingLine1,
    heroHeadingScript: bp.heroHeadingScript,
    heroImage: await uploadImage(bp.heroImage, 'backstage-hero.jpg', assetMap),
    heroImageAlt: bp.heroImageAlt,
    introText: bp.introText,
    videos: await Promise.all(legacy.data.getVideos.map(async (x: any, i: number) => ({
      _key: x.id || `video-${i + 1}`,
      _type: 'backstageVideo',
      title: x.title,
      description: x.description,
      embedUrl: x.embedUrl,
      thumbnail: await uploadImage(x.thumbnail, `backstage-${i + 1}.jpg`, assetMap),
      thumbnailAlt: x.thumbnailAlt,
    }))),
    ctaHeading: bp.ctaHeading,
    ctaButtonLabel: bp.ctaButtonLabel,
    ctaButtonLink: bp.ctaButtonLink,
    seo: {
      _type: 'seo',
      metaTitle: 'Backstage — Behind the Scenes | Diana Weddings',
      metaDescription: bp.introText,
      noIndex: false,
      noFollow: false,
    },
  })

  // ─────────────────────────────────────────────
  // Contact Page
  // ─────────────────────────────────────────────
  const cp = legacy.contact
  await upsert('contactPage', 'contactPage', {
    ...cp,
    heroImage: await uploadImage(cp.heroImage, 'contact-hero.jpg', assetMap),
    seo: {
      _type: 'seo',
      metaTitle: 'Contact Diana — Ottawa Wedding Planner',
      metaDescription: cp.formDescription,
      noIndex: false,
      noFollow: false,
    },
  })

  // Persist the image cache locally so re-running the migration does not upload duplicates.
  writeFileSync(statePath, JSON.stringify({migratedAt: new Date().toISOString(), assetMap}, null, 2))

  console.log('\nMigration complete.')
  console.log(`Cached ${Object.keys(assetMap).length} image assets.`)
  console.log('Open Sanity Studio and verify the Website, Brand & Design, Services and Wedding Albums sections.')
}

main().catch((error) => {
  console.error('\nMigration failed:')
  console.error(error)
  process.exit(1)
})
