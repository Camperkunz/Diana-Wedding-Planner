import { cache } from 'react';
import type { Metadata } from 'next';
import { client } from '@/app/sanity/client';
import type { SanityImageSource } from '@sanity/image-url';
import { GALLERY_IMAGE_WIDTHS, imageDimensions, sanityImage, sanityImageSrcSet } from '@/lib/sanity-image';
import { safeCanonicalUrl, safeImageSrc } from '@/lib/safe-url';
import { absoluteUrl } from '@/lib/site';
import { sanityFetchOptions } from '@/lib/sanity-tags';

// Все геттеры ниже — НЕ СРОЧНЫЕ чтения: CDN-клиент (useCdn: true, квота 1M/мес)
// + дедупликация cache() в рамках одного рендера. Срочные запросы (draft/preview,
// мгновенная свежесть) — через liveClient из '@/app/sanity/client' (квота 250k/мес).

export type SiteSettings = {
  name: string;
  tagline: string;
  logo?: string;
  logoAlt?: string;
  favicon?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  serviceArea?: string;
  googleAnalyticsId?: string;
  socialLinks: { platform: string; url: string }[];
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string; canonicalUrl?: string; noIndex?: boolean; noFollow?: boolean };
};

export type SiteLayout = {
  headerLogo?: string;
  headerLogoAlt?: string;
  navLinks: { label: string; link: string; order?: number }[];
  copyrightText?: string;
  footerDescription?: string;
  footerExploreLabel?: string;
  footerContactLabel?: string;
  footerNavLinks: { label: string; link: string }[];
  footerEmail?: string;
  footerPhone?: string;
  footerAddress?: string;
  footerSocialLinks?: { platform: string; url: string }[];
};

/**
 * One photo of an album gallery, already resolved.
 *
 * The URL work happens once per album render instead of once per photo render:
 * `src`, `srcSet` and the pixel size used to be derived inside `ResponsiveImage`
 * for every photo (one URL plus one rewritten URL per width), which is exactly
 * the part that grows with the number of photos on the page.
 */
export type AlbumPhoto = {
  /** Stable React key: Sanity's array `_key`, or the URL when a photo has none. */
  id: string;
  /** `src` fallback, built at the top gallery width (see `GALLERY_IMAGE_WIDTHS`). */
  src: string;
  srcSet?: string;
  /** Original pixel size, so the browser can reserve the box before the load. */
  width?: number;
  height?: number;
  alt: string;
  caption?: string;
};

/**
 * Everything a listing renders (portfolio grid, home page album cards).
 *
 * Deliberately has no gallery: `photos[]{ image, alt, caption }` was fetched for
 * every album on the page, so the payload of a listing grew with the photo count
 * of the whole archive even though a card only ever shows the cover.
 */
export type AlbumCard = {
  _id: string;
  slug: string;
  title: string;
  category?: string;
  /** Resolved cover: the explicit `coverImage` or, when unset, the first gallery photo. */
  coverImage?: string;
  coverImageAlt?: string;
  date?: string;
  venue?: string;
  location?: string;
};

/** The album detail page: a card, plus the story, the SEO block and the gallery. */
export type Album = AlbumCard & {
  story?: string;
  photos: AlbumPhoto[];
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: any; canonicalUrl?: string; noIndex?: boolean; noFollow?: boolean };
};

export type Service = {
  _id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  includes: string[];
  image?: string;
  imageAlt?: string;
  startingPrice?: string;
  featured?: boolean;
  order?: number;
};

export type ComparisonValue = {
  serviceId: string;
  value: string;
};

export type ComparisonRow = {
  label: string;
  values: ComparisonValue[];
};

export type HomePageContent = {
  seo?: any;
  heroEyebrow?: string;
  /** Single line of text; `*word*` marks the word that uses the handwritten script font. */
  heroHeading?: string;
  heroDescription?: string;
  /** Raw Sanity image object: the hero builds sanitised, responsive URLs from it. */
  heroImage?: SanityImageSource;
  heroImageAlt?: string;
  heroPrimaryButtonLabel?: string;
  heroPrimaryButtonLink?: string;
  heroSecondaryButtonLabel?: string;
  heroSecondaryButtonLink?: string;
  aboutEyebrow?: string;
  aboutHeading?: string;
  /** Paragraphs entered in the Studio, in display order. */
  aboutParagraphs: string[];
  aboutLinkLabel?: string;
  aboutLink?: string;
  aboutImage1?: string;
  aboutImage2?: string;
  aboutImage1Alt?: string;
  aboutImage2Alt?: string;
  stats: { value: string; label: string }[];
  servicesEyebrow?: string;
  servicesHeading?: string;
  servicesDescription?: string;
  servicesButtonLabel?: string;
  servicesButtonLink?: string;
  featuredServices: Service[];
  quoteImage?: string;
  quoteImageAlt?: string;
  quoteText?: string;
  quoteAuthor?: string;
  portfolioEyebrow?: string;
  portfolioHeading?: string;
  portfolioButtonLabel?: string;
  portfolioButtonLink?: string;
  featuredAlbums: AlbumCard[];
  approachEyebrow?: string;
  approachHeading?: string;
  approachImage?: string;
  approachImageAlt?: string;
  approachSteps: { number: string; title: string; description?: string }[];
  testimonialsEyebrow?: string;
  testimonialsHeading?: string;
  testimonialsSubtext?: string;
  testimonials: { quote: string; author: string; weddingType?: string }[];
  ctaEyebrow?: string;
  /** Same `*word*` syntax as `heroHeading`. */
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  ctaButtonLink?: string;
  /** Raw Sanity image object: the CTA photo band builds sanitised, responsive URLs from it. */
  ctaImage?: SanityImageSource;
  ctaImageAlt?: string;
};

export function hexToHsl(hex?: string) {
  if (!hex) return undefined;
  const value = hex.trim().replace('#', '');
  // Strict hex check: a 6-character non-hex value (e.g. "#zzzzzz") used to pass
  // the old length-only guard, and parseInt() then produced NaN — every derived
  // custom property (--accent, --ring, …) became an invalid CSS token, so every
  // `hsl(var(--…))` declaration using it silently disappeared site-wide.
  if (!/^[0-9a-f]{6}$/i.test(value)) return undefined;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Album detail projection: everything the album page renders, gallery included.
 * `_key` rides along so React keys photos by their identity in the array instead
 * of by index (an index key makes React re-mount every photo after an edit).
 */
const albumProjection = `
  _id, title, slug, category, coverImage, coverImageAlt,
  story, date, venue, location,
  seo{ metaTitle, metaDescription, ogImage, canonicalUrl, noIndex, noFollow },
  photos[]{ _key, image, alt, caption }
`;

/**
 * Listing projection: a card renders the cover and the meta line, never the
 * gallery — see `AlbumCard`.
 *
 * The cover fallback is resolved by the query instead of in JS: `coalesce`
 * returns an image object from either branch, so `mapAlbumCard` has a single
 * code path. `defined(image.asset)` skips photos whose asset is missing (deleted
 * in the Studio, failed upload), which is the filter `mapAlbum` applies by hand.
 */
const albumCardProjection = `
  _id, title, slug, category, coverImageAlt,
  date, venue, location,
  "coverImage": coalesce(coverImage, photos[defined(image.asset)][0].image)
`;

/**
 * Shared SEO projection: keeps the four editable values as they are and resolves
 * the social-share photo to a real URL (`sanityImage` never throws and returns
 * `undefined` for a deleted asset, so a missing picture cannot break a page).
 */
function mapSeo(seo: any) {
  if (!seo) return undefined;
  return {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    ogImage: sanityImage(seo.ogImage, 1200),
    canonicalUrl: seo.canonicalUrl,
    noIndex: seo.noIndex,
    noFollow: seo.noFollow,
  };
}

/** Cover width used by listings: enough for a two-column card on a wide screen. */
const ALBUM_COVER_WIDTH = 1800;

/** Widest file the gallery ever asks the CDN for — the `src` fallback width. */
const GALLERY_TOP_WIDTH = GALLERY_IMAGE_WIDTHS[GALLERY_IMAGE_WIDTHS.length - 1] ?? 1280;

/**
 * Listing mapper. `albumCardProjection` hands over a single resolved cover, so
 * this stays one code path whether the editor set a cover or the album falls back
 * to its first gallery photo.
 */
function mapAlbumCard(album: any): AlbumCard {
  return {
    _id: album._id,
    slug: album.slug?.current || '',
    title: album.title,
    category: album.category,
    coverImage: sanityImage(album.coverImage, ALBUM_COVER_WIDTH),
    coverImageAlt: album.coverImageAlt,
    date: album.date,
    venue: album.venue,
    location: album.location,
  };
}

function mapAlbum(album: any): Album {
  // A photo whose asset is missing (deleted in the Studio, failed upload) is
  // dropped instead of rendering an empty `src`, which would make the browser
  // request the current page as an image.
  const photos = (album.photos || [])
    .map((photo: any) => {
      // Resolved here, once per photo per render, instead of inside the gallery
      // component: that used to re-read the image size and re-write one CDN URL
      // per srcSet entry for every photo on every pass.
      let src = sanityImage(photo.image, GALLERY_TOP_WIDTH);
      const dimensions = imageDimensions(src);
      // Never ask the CDN for more pixels than the file holds — it would only
      // upscale them: a 1000px upload gets a 1000px `src`, not a padded 1280 one.
      if (dimensions?.width && dimensions.width < GALLERY_TOP_WIDTH) {
        src = sanityImage(photo.image, dimensions.width);
      }
      return {
        id: photo._key || src,
        src,
        // Built from the resolved URL, not from the image object: `srcSetFromUrl`
        // drops the widths this file cannot fill, so a 1000px photo ships the two
        // entries it has instead of four the CDN would have to pad.
        srcSet: sanityImageSrcSet(src, GALLERY_IMAGE_WIDTHS),
        width: dimensions?.width,
        height: dimensions?.height,
        alt: photo.alt || album.title,
        caption: photo.caption,
      };
    })
    .filter((photo: { src?: string }): photo is AlbumPhoto => Boolean(photo.src));

  const card = mapAlbumCard(album);

  return {
    ...card,
    // Coverless albums still show their first gallery photo in the album hero.
    // That is the gallery file (1280px, or the original when it is smaller), not
    // the old 1800px one: the hero's own srcSet still offers up to 1920, so this
    // only changes the fallback for browsers that ignore srcSet.
    coverImage: card.coverImage || photos[0]?.src,
    story: album.story,
    seo: mapSeo(album.seo),
    photos,
  };
}

function mapService(service: any): Service {
  return {
    _id: service._id,
    slug: service.slug?.current || '',
    name: service.name,
    shortDescription: service.shortDescription,
    fullDescription: service.fullDescription,
    includes: service.includes || [],
    image: sanityImage(service.image, 1200),
    imageAlt: service.imageAlt,
    startingPrice: service.startingPrice,
    featured: service.featured,
    order: service.order,
  };
}

// ── «Шапка» сайта: settings + layout + design одним запросом ───────────────
// Раньше три документа запрашивались отдельно, а геттеры вызывались по 2–3 раза
// за рендер (generateMetadata + layout + страница) — до 6 HTTP-запросов. Один
// GROQ-запрос + cache() в рамках рендера сводит всё к одному запросу.
const siteChromeQuery = `{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    siteTitle, tagline, location, serviceArea, email, phone, address, logo, logoAlt, favicon,
    googleAnalyticsId,
    socialLinks[]{ platform, url }, seo{ metaTitle, metaDescription, ogImage, canonicalUrl,
    noIndex, noFollow }
  },
  "layout": *[_type == "siteLayout" && _id == "siteLayout"][0]{
    headerLogo, navLinks[]{ label, link, order }, copyrightText, footerDescription,
    footerExploreLabel, footerContactLabel, footerNavLinks[]{ label, link },
    footerEmail, footerPhone, footerAddress, footerSocialLinks[]{ platform, url }
  },
  "design": *[_type == "siteDesign" && _id == "siteDesign"][0]{
    background, foreground, secondary, mutedForeground, accent, accentOverlay,
    accentForeground, border, sage, blush, sand, terracotta
  }
}`;

const fetchSiteChrome = cache(async () =>
  client.fetch(
    siteChromeQuery,
    {},
    sanityFetchOptions('siteSettings', 'siteLayout', 'siteDesign')
  )
);

function mapSiteSettings(data: any): SiteSettings | null {
  if (!data) return null;
  return {
    name: data.siteTitle,
    tagline: data.tagline || '',
    location: data.location,
    serviceArea: data.serviceArea,
    // 600px: wide enough for a 2x-retina header/footer logo (displayed up to
    // 180px) without shipping a full-size asset as the default `src`.
    logo: sanityImage(data.logo, 600),
    logoAlt: data.logoAlt,
    // The browser icon is requested as a square: `fit('crop')` + `height` keep it
    // from being stretched, and `sanityImage` returns `undefined` if the asset was
    // deleted instead of throwing inside the root layout (which would take down
    // every page of the site).
    favicon: sanityImage(data.favicon, 64, undefined, { height: 64, fit: 'crop' }),
    email: data.email,
    phone: data.phone,
    address: data.address,
    // Security: the value is interpolated into an inline gtag snippet on the
    // client, so it is re-validated here (defense in depth on top of the Studio
    // validation). Anything that is not a plain GA4 Measurement ID becomes
    // `undefined` and no analytics script is rendered at all.
    googleAnalyticsId: /^G-[A-Z0-9]{4,}$/i.test((data.googleAnalyticsId || '').trim())
      ? data.googleAnalyticsId.trim()
      : undefined,
    socialLinks: data.socialLinks || [],
    seo: mapSeo(data.seo),
  };
}

function mapSiteLayout(data: any): SiteLayout | null {
  if (!data) return null;
  return {
    headerLogo: sanityImage(data.headerLogo, 600),
    headerLogoAlt: data.headerLogo?.alt,
    navLinks: (data.navLinks || []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    copyrightText: data.copyrightText,
    footerDescription: data.footerDescription,
    footerExploreLabel: data.footerExploreLabel,
    footerContactLabel: data.footerContactLabel,
    footerNavLinks: data.footerNavLinks || [],
    footerEmail: data.footerEmail,
    footerPhone: data.footerPhone,
    footerAddress: data.footerAddress,
    footerSocialLinks: data.footerSocialLinks || undefined,
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const chrome = await fetchSiteChrome();
  return chrome?.settings ? mapSiteSettings(chrome.settings) : null;
});

export const getSiteLayout = cache(async (): Promise<SiteLayout | null> => {
  const chrome = await fetchSiteChrome();
  return chrome?.layout ? mapSiteLayout(chrome.layout) : null;
});

/**
 * All albums, in the order the editor sets by dragging the “Albums (order)”
 * list in the Home page document. That array is the single source of order for
 * the whole website: the Portfolio grid and the homepage cards (first 3) use the
 * same list, so the featured albums are always the same three in the same order.
 * Albums that are not in the list yet (just created) fall to the end, newest
 * first, so a new album can never disappear from the portfolio.
 */
export const getAlbums = cache(async (): Promise<AlbumCard[]> => {
  // Cards only need the cover — see `albumCardProjection`.
  const [data, featuredOrder] = await Promise.all([
    client.fetch(
      `*[_type == "album"] | order(_createdAt desc){${albumCardProjection}}`,
      {},
      sanityFetchOptions('album')
    ),
    client.fetch(
      `*[_type == "homePage" && _id == "homePage"][0].featuredAlbums[]->_id`,
      {},
      // Tagged homePage too, so reordering the list in the Studio purges the
      // cached Portfolio page through the webhook, not only the home page.
      sanityFetchOptions('homePage')
    ),
  ]);

  const rank = new Map<string, number>(
    (featuredOrder || []).map((id: string, index: number): [string, number] => [id, index])
  );

  // Stable sort: albums the Home page list does not mention keep the GROQ
  // order (newest first).
  const albums: AlbumCard[] = (data || []).map(mapAlbumCard);
  return albums.sort((a: AlbumCard, b: AlbumCard) => {
    const rankA = rank.get(a._id);
    const rankB = rank.get(b._id);
    if (rankA === undefined && rankB === undefined) return 0;
    if (rankA === undefined) return 1;
    if (rankB === undefined) return -1;
    return rankA - rankB;
  });
});

export const getAlbum = cache(async (slug: string): Promise<Album | null> => {
  const data = await client.fetch(
    `*[_type == "album" && slug.current == $slug][0]{${albumProjection}}`,
    { slug },
    sanityFetchOptions('album')
  );
  return data ? mapAlbum(data) : null;
});

/**
 * All services, in the order the editor sets by dragging the “Services (order)”
 * list in the Home page document. That array is the single source of order for
 * the whole website: it drives the Services page list, the comparison table
 * columns, the Contact form and the homepage cards (first 3). Services that are
 * not in the list yet fall to the end in the legacy `order` / creation order, so
 * a newly created service can never disappear from a page.
 */
export const getServices = cache(async (): Promise<Service[]> => {
  const [data, featuredOrder] = await Promise.all([
    client.fetch(
      `*[_type == "service"] | order(coalesce(order, 9999) asc, _createdAt asc){
      _id, name, slug, shortDescription, fullDescription, includes, image, imageAlt, startingPrice, featured, order
    }`,
      {},
      sanityFetchOptions('service')
    ),
    client.fetch(
      `*[_type == "homePage" && _id == "homePage"][0].featuredServices[]->_id`,
      {},
      // Tagged homePage too, so reordering the list in the Studio purges the
      // cached Services page through the webhook, not only the home page.
      sanityFetchOptions('homePage')
    ),
  ]);

  const rank = new Map<string, number>(
    (featuredOrder || []).map((id: string, index: number): [string, number] => [id, index])
  );

  // Stable sort: entries the Home page list does not mention keep the GROQ
  // order (legacy `order` number, then creation date).
  const services: Service[] = (data || []).map(mapService);
  return services.sort((a: Service, b: Service) => {
    const rankA = rank.get(a._id);
    const rankB = rank.get(b._id);
    if (rankA === undefined && rankB === undefined) return 0;
    if (rankA === undefined) return 1;
    if (rankB === undefined) return -1;
    return rankA - rankB;
  });
});

/**
 * The Studio stores the “Meet Diana” copy as an array of paragraphs, so the number
 * of paragraphs is decided by the editor. `aboutParagraph1` / `aboutParagraph2` are
 * the fields this section used before that array existed: they are folded in only
 * while a document has no `aboutParagraphs` yet, so the page keeps its text until
 * the content is migrated in the Studio. A blank line inside one entry also starts
 * a new paragraph — the same convention the About page story already uses.
 */
function toParagraphs(value: unknown): string[] {
  return (Array.isArray(value) ? value : [])
    .flatMap((paragraph) => String(paragraph ?? '').split(/\n\s*\n/))
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export const getHomePage = cache(async (): Promise<HomePageContent | null> => {
  // aboutParagraph1/aboutParagraph2 are the legacy fields read only as a fallback
  // for documents that have not been migrated to aboutParagraphs yet.
  const data = await client.fetch(
    `*[_type == "homePage" && _id == "homePage"][0]{
    seo{ metaTitle, metaDescription, ogImage, canonicalUrl, noIndex, noFollow },
    heroEyebrow, heroHeading, heroDescription, heroImage, heroImageAlt,
    heroPrimaryButtonLabel, heroPrimaryButtonLink, heroSecondaryButtonLabel, heroSecondaryButtonLink,
    aboutEyebrow, aboutHeading, aboutParagraphs, aboutParagraph1, aboutParagraph2, aboutLinkLabel, aboutLink,
    aboutImage1, aboutImage2, aboutImage1Alt, aboutImage2Alt,
    stats[]{ value, label },
    servicesEyebrow, servicesHeading, servicesDescription, servicesButtonLabel, servicesButtonLink,
    featuredServices[]->{ _id, name, slug, shortDescription, fullDescription, includes, image, imageAlt, startingPrice, featured, order },
    quoteImage, quoteImageAlt, quoteText, quoteAuthor,
    portfolioEyebrow, portfolioHeading, portfolioButtonLabel, portfolioButtonLink,
    featuredAlbums[]->{${albumCardProjection}},
    approachEyebrow, approachHeading, approachImage, approachImageAlt, approachSteps[]{ number, title, description },
    testimonialsEyebrow, testimonialsHeading, testimonialsSubtext, testimonials[]{ quote, author, weddingType },
    ctaEyebrow, ctaHeading, ctaDescription, ctaButtonLabel, ctaButtonLink, ctaDirectContactText, ctaImage, ctaImageAlt
  }`,
    {},
    sanityFetchOptions('homePage', 'album', 'service')
  );
  if (!data) return null;

  return {
    ...data,
    aboutParagraphs: toParagraphs(
      data.aboutParagraphs?.length
        ? data.aboutParagraphs
        : [data.aboutParagraph1, data.aboutParagraph2]
    ),
    seo: mapSeo(data.seo),
    heroImage: data.heroImage,
    aboutImage1: sanityImage(data.aboutImage1, 900),
    aboutImage2: sanityImage(data.aboutImage2, 900),
    quoteImage: sanityImage(data.quoteImage, 1920),
    approachImage: sanityImage(data.approachImage, 900),
    ctaImage: data.ctaImage,
    stats: data.stats || [],
    featuredServices: (data.featuredServices || []).map(mapService),
    featuredAlbums: (data.featuredAlbums || []).map(mapAlbumCard),
    approachSteps: data.approachSteps || [],
    testimonials: data.testimonials || [],
  };
});

export const getBackstageVideos = cache(async () => {
  return client.fetch(
    `
    *[
      _type == "backstageVideo" &&
      isVisible != false
    ]
    | order(order asc)
  `,
    {},
    sanityFetchOptions('backstageVideo')
  );
});

export type SiteDesign = {
  colors: Record<string, string | undefined>;
};

function mapColor(value: any) {
  return value?.hex || undefined;
}

export const getSiteDesign = cache(async (): Promise<SiteDesign | null> => {
  const data = (await fetchSiteChrome())?.design;
  if (!data) return null;
  return {
    colors: {
      background: mapColor(data.background), foreground: mapColor(data.foreground), secondary: mapColor(data.secondary),
      mutedForeground: mapColor(data.mutedForeground), accent: mapColor(data.accent), accentOverlay: mapColor(data.accentOverlay),
      accentForeground: mapColor(data.accentForeground), border: mapColor(data.border), sage: mapColor(data.sage),
      blush: mapColor(data.blush), sand: mapColor(data.sand), terracotta: mapColor(data.terracotta),
    },
  };
});

/**
 * Reads one of the fixed page documents (`aboutPage`, `faqPage`, …).
 *
 * The canonical document id equals the type name. A page that was deleted and
 * re-created by hand, however, gets a random id — the old query then returned
 * `null` and the whole page rendered empty. So: prefer the document whose id is
 * the type name and otherwise fall back to the most recently edited document of
 * that type, which means a page can never silently disappear from the website.
 */
export const getFixedPage = cache(async (type: string) => {
  const data = await client.fetch(
    `*[_type == $type] | order(select(_id == $type => 0, 1) asc, _updatedAt desc)[0]{...}`,
    { type },
    sanityFetchOptions(type)
  );
  if (!data) return null;
  // `seo.ogImage` is a Studio `image` field, so GROQ returns an object — not a
  // URL. Next's metadata resolver expects a string and throws
  // `The "path" argument must be of type string` while prerendering a page
  // whose Open Graph image is an object, which in turn makes every ISR
  // revalidation of that page fail. `mapSeo` resolves it the same way the
  // album and settings getters do.
  return { ...data, seo: mapSeo(data.seo) };
});

export async function getAboutPage() { return getFixedPage('aboutPage'); }

// servicesPage has its own query (rather than the generic getFixedPage) because
// comparisonRows needs its service references dereferenced into plain serviceId/value pairs.
export const getServicesPage = cache(async () => {
  const data = await client.fetch(
    `*[_type == "servicesPage" && _id == "servicesPage"][0]{
    ...,
    comparisonRows[]{
      label,
      values[]{
        "serviceId": service->_id,
        value
      }
    }
  }`,
    {},
    sanityFetchOptions('servicesPage', 'service')
  );
  if (!data) return null;
  // See getFixedPage: the social image arrives as an image object.
  return { ...data, seo: mapSeo(data.seo) };
});

export async function getPortfolioPage() { return getFixedPage('portfolioPage'); }
export async function getFaqPage() { return getFixedPage('faqPage'); }
export async function getBackstagePage() { return getFixedPage('backstagePage'); }
export async function getContactPage() { return getFixedPage('contactPage'); }
// privacyPolicy lives under Brand & Settings > Policies in the Studio; `content`
// is a plain text field parsed by src/app/privacy/page.tsx (see the syntax note
// on the field in the Studio).
export async function getPrivacyPolicy() { return getFixedPage('privacyPolicy'); }

/**
 * Page metadata for every route.
 *
 * `openGraph`/`twitter` are always returned — not only when the editor uploaded
 * a social image. Next.js replaces the parent layout's `openGraph` object as a
 * whole, so returning `undefined` here silently erased the site-wide tags and
 * most pages shipped with no social preview at all. The site-wide image and
 * description are used when the page has none of its own.
 *
 * `path` is the route's own path (`/services`, `/portfolio/…`). It produces the
 * self-referencing canonical and `og:url` when the editor left
 * "Canonical URL" empty in the Studio.
 *
 * `robots` is emitted only for pages the editor hid from search engines. The
 * root layout no longer sets `robots` at all, so `undefined` here means "no meta
 * robots tag" → indexable by default, and the `noIndex` switch in the Studio
 * still wins.
 */
export async function buildSeoMetadata(
  seo: any,
  fallbackTitle: string,
  fallbackDescription?: string,
  path?: string
): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = seo?.metaTitle || fallbackTitle;
  const description =
    seo?.metaDescription || fallbackDescription || settings?.seo?.metaDescription;
  const image = sanityImage(seo?.ogImage || settings?.seo?.ogImage, 1200);
  // Canonical: the editor's absolute URL wins (cross-domain cases), otherwise
  // the page canonicalises to itself. Without that fallback every inner page
  // shipped without a canonical at all, so `?utm=…` and the www host could be
  // indexed as separate copies of the same page.
  const url = safeCanonicalUrl(seo?.canonicalUrl) ?? (path ? absoluteUrl(path) : undefined);

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: seo?.noIndex ? { index: false, follow: !seo?.noFollow } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: settings?.name || undefined,
      // Canadian site: `en_CA` is what Facebook/LinkedIn use to pick the locale
      // variant of a shared link (the html lang is en-CA as well).
      locale: 'en_CA',
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}