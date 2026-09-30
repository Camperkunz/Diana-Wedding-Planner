import { cache } from 'react';
import { client } from '@/app/sanity/client';
import { urlFor } from '@/app/sanity/image';
import type { SanityImageSource } from '@sanity/image-url';

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

export type Album = {
  _id: string;
  slug: string;
  title: string;
  category?: string;
  coverImage?: string;
  coverImageAlt?: string;
  story?: string;
  shortDescription?: string;
  date?: string;
  venue?: string;
  location?: string;
  order?: number;
  photos: { src: string; alt: string; caption?: string }[];
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
  aboutParagraph1?: string;
  aboutParagraph2?: string;
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
  featuredAlbums: Album[];
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
  const value = hex.replace('#', '');
  if (value.length !== 6) return undefined;
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

const albumProjection = `
  _id, title, slug, category, coverImage, coverImageAlt, shortDescription, order,
  story, date, venue, location,
  seo{ metaTitle, metaDescription, ogImage, canonicalUrl, noIndex, noFollow },
  photos[]{ image, alt, caption }
`;

function mapAlbum(album: any): Album {
  return {
    _id: album._id,
    slug: album.slug?.current || '',
    title: album.title,
    category: album.category,
    coverImage: album.coverImage ? urlFor(album.coverImage).width(1800).auto('format').url() : undefined,
    coverImageAlt: album.coverImageAlt,
    shortDescription: album.shortDescription,
    story: album.story || album.shortDescription,
    date: album.date,
    venue: album.venue,
    location: album.location,
    order: album.order,
    seo: album.seo ? { metaTitle: album.seo.metaTitle, metaDescription: album.seo.metaDescription, ogImage: album.seo.ogImage, canonicalUrl: album.seo.canonicalUrl, noIndex: album.seo.noIndex, noFollow: album.seo.noFollow } : undefined,
    photos: (album.photos || []).filter((p: any) => p.image).map((p: any) => ({
      src: urlFor(p.image).width(1800).auto('format').url(),
      alt: p.alt || album.title,
      caption: p.caption,
    })),
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
    image: service.image ? urlFor(service.image).width(1200).auto('format').url() : undefined,
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

const fetchSiteChrome = cache(async () => client.fetch(siteChromeQuery));

function mapSiteSettings(data: any): SiteSettings | null {
  if (!data) return null;
  return {
    name: data.siteTitle,
    tagline: data.tagline || '',
    location: data.location,
    serviceArea: data.serviceArea,
    logo: data.logo ? urlFor(data.logo).width(600).auto('format').url() : undefined,
    logoAlt: data.logoAlt,
    favicon: data.favicon ? urlFor(data.favicon).width(64).height(64).fit('crop').auto('format').url() : undefined,
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
    seo: data.seo ? { metaTitle: data.seo.metaTitle, metaDescription: data.seo.metaDescription, ogImage: data.seo.ogImage ? urlFor(data.seo.ogImage).width(1200).auto('format').url() : undefined, canonicalUrl: data.seo.canonicalUrl, noIndex: data.seo.noIndex, noFollow: data.seo.noFollow } : undefined,
  };
}

function mapSiteLayout(data: any): SiteLayout | null {
  if (!data) return null;
  return {
    headerLogo: data.headerLogo ? urlFor(data.headerLogo).width(600).auto('format').url() : undefined,
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

export const getAlbums = cache(async (): Promise<Album[]> => {
  const data = await client.fetch(`*[_type == "album"] | order(coalesce(order, 9999) asc, _createdAt desc){${albumProjection}}`);
  return (data || []).map(mapAlbum);
});

export const getAlbum = cache(async (slug: string): Promise<Album | null> => {
  const data = await client.fetch(`*[_type == "album" && slug.current == $slug][0]{${albumProjection}}`, { slug });
  return data ? mapAlbum(data) : null;
});

export const getServices = cache(async (): Promise<Service[]> => {
  const data = await client.fetch(`*[_type == "service"] | order(coalesce(order, 9999) asc, _createdAt asc){
    _id, name, slug, shortDescription, fullDescription, includes, image, imageAlt, startingPrice, featured, order
  }`);
  return (data || []).map(mapService);
});

export const getHomePage = cache(async (): Promise<HomePageContent | null> => {
  const data = await client.fetch(`*[_type == "homePage" && _id == "homePage"][0]{
    seo{ metaTitle, metaDescription, ogImage, canonicalUrl, noIndex, noFollow },
    heroEyebrow, heroHeading, heroDescription, heroImage, heroImageAlt,
    heroPrimaryButtonLabel, heroPrimaryButtonLink, heroSecondaryButtonLabel, heroSecondaryButtonLink,
    aboutEyebrow, aboutHeading, aboutParagraph1, aboutParagraph2, aboutLinkLabel, aboutLink,
    aboutImage1, aboutImage2, aboutImage1Alt, aboutImage2Alt,
    stats[]{ value, label },
    servicesEyebrow, servicesHeading, servicesDescription, servicesButtonLabel, servicesButtonLink,
    featuredServices[]->{ _id, name, slug, shortDescription, fullDescription, includes, image, imageAlt, startingPrice, featured, order },
    quoteImage, quoteImageAlt, quoteText, quoteAuthor,
    portfolioEyebrow, portfolioHeading, portfolioButtonLabel, portfolioButtonLink,
    featuredAlbums[]->{${albumProjection}},
    approachEyebrow, approachHeading, approachImage, approachImageAlt, approachSteps[]{ number, title, description },
    testimonialsEyebrow, testimonialsHeading, testimonialsSubtext, testimonials[]{ quote, author, weddingType },
    ctaEyebrow, ctaHeading, ctaDescription, ctaButtonLabel, ctaButtonLink, ctaDirectContactText, ctaImage, ctaImageAlt
  }`);
  if (!data) return null;

  return {
    ...data,
    seo: data.seo ? { metaTitle: data.seo.metaTitle, metaDescription: data.seo.metaDescription, ogImage: data.seo.ogImage ? urlFor(data.seo.ogImage).width(1200).auto('format').url() : undefined, canonicalUrl: data.seo.canonicalUrl, noIndex: data.seo.noIndex, noFollow: data.seo.noFollow } : undefined,
    heroImage: data.heroImage,
    aboutImage1: data.aboutImage1 ? urlFor(data.aboutImage1).width(900).auto('format').url() : undefined,
    aboutImage2: data.aboutImage2 ? urlFor(data.aboutImage2).width(900).auto('format').url() : undefined,
    quoteImage: data.quoteImage ? urlFor(data.quoteImage).width(1920).auto('format').url() : undefined,
    approachImage: data.approachImage ? urlFor(data.approachImage).width(900).auto('format').url() : undefined,
    ctaImage: data.ctaImage,
    stats: data.stats || [],
    featuredServices: (data.featuredServices || []).map(mapService),
    featuredAlbums: (data.featuredAlbums || []).map(mapAlbum),
    approachSteps: data.approachSteps || [],
    testimonials: data.testimonials || [],
  };
});

export const getBackstageVideos = cache(async () => {
  return client.fetch(`
    *[
      _type == "backstageVideo" &&
      isVisible != false
    ]
    | order(order asc)
  `)
});

export const getPage = cache(async (slug: string) => {
  return client.fetch(`*[_type == "page" && slug.current == $slug][0]{
    _id, title, slug, seo{ metaTitle, metaDescription, ogImage, canonicalUrl, noIndex, noFollow }, sections[]{
      ...,
      _type == "galleryPreviewSection" => { featuredAlbums[]->{${albumProjection}} }
    }
  }`, { slug });
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

function pageProjection(type: string, slug: string) {
  return client.fetch(`*[_type == $type && _id == $id][0]{...}`, { type, id: slug });
}

export const getFixedPage = cache(async (type: string) => {
  return pageProjection(type, type);
});

export async function getAboutPage() { return getFixedPage('aboutPage'); }

// servicesPage has its own query (rather than the generic getFixedPage) because
// comparisonRows needs its service references dereferenced into plain serviceId/value pairs.
export const getServicesPage = cache(async () => {
  return client.fetch(`*[_type == "servicesPage" && _id == "servicesPage"][0]{
    ...,
    comparisonRows[]{
      label,
      values[]{
        "serviceId": service->_id,
        value
      }
    }
  }`);
});

export async function getPortfolioPage() { return getFixedPage('portfolioPage'); }
export async function getFaqPage() { return getFixedPage('faqPage'); }
export async function getBackstagePage() { return getFixedPage('backstagePage'); }
export async function getContactPage() { return getFixedPage('contactPage'); }

export function buildSeoMetadata(seo: any, fallbackTitle: string, fallbackDescription?: string) {
  return {
    title: seo?.metaTitle || fallbackTitle,
    description: seo?.metaDescription || fallbackDescription,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.noIndex ? { index: false, follow: !seo?.noFollow } : undefined,
    openGraph: seo?.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}