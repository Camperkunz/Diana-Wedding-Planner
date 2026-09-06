import { client } from '@/app/sanity/client';
import { urlFor } from '@/app/sanity/image';

export type SanityImage = {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  crop?: unknown;
  hotspot?: unknown;
};

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
  socialLinks: { platform: string; url: string }[];
  accentColorHsl?: string;
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
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
  date?: string;
  venue?: string;
  location?: string;
  order?: number;
  photos: { src: string; alt: string; caption?: string }[];
};

export type HomeSection = Record<string, any> & { _key: string; _type: string };

function hexToHsl(hex?: string) {
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

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const data = await client.fetch(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
    siteTitle, tagline, location, serviceArea, logo, logoAlt, favicon, accentColor,
    socialLinks[]{ platform, url },
    seo{ metaTitle, metaDescription, ogImage }
  }`);
  if (!data) return null;
  return {
    name: data.siteTitle,
    tagline: data.tagline || '',
    location: data.location,
    serviceArea: data.serviceArea,
    logo: data.logo ? urlFor(data.logo).width(600).auto('format').url() : undefined,
    logoAlt: data.logoAlt,
    favicon: data.favicon ? urlFor(data.favicon).width(64).height(64).fit('crop').auto('format').url() : undefined,
    socialLinks: data.socialLinks || [],
    accentColorHsl: hexToHsl(data.accentColor?.hex),
    seo: data.seo ? { metaTitle: data.seo.metaTitle, metaDescription: data.seo.metaDescription, ogImage: data.seo.ogImage ? urlFor(data.seo.ogImage).width(1200).auto('format').url() : undefined } : undefined,
  };
}

export async function getSiteLayout(): Promise<SiteLayout | null> {
  const data = await client.fetch(`*[_type == "siteLayout" && _id == "siteLayout"][0]{
    headerLogo, navLinks[]{ label, link, order },
    copyrightText, footerDescription, footerExploreLabel, footerContactLabel, footerNavLinks[]{ label, link },
    footerEmail, footerPhone, footerAddress,
    footerSocialLinks[]{ platform, url }
  }`);
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

export async function getAlbums(): Promise<Album[]> {
  const data = await client.fetch(`*[_type == "album"] | order(coalesce(order, 9999) asc, _createdAt desc){
    _id, title, slug, category, coverImage, coverImageAlt, shortDescription, order,
    story, date, venue, location,
    photos[]{ image, alt, caption }
  }`);
  return (data || []).map((album: any) => ({
    _id: album._id,
    slug: album.slug?.current || '',
    title: album.title,
    category: album.category,
    coverImage: album.coverImage ? urlFor(album.coverImage).width(1400).auto('format').url() : undefined,
    coverImageAlt: album.coverImageAlt,
    story: album.story || album.shortDescription,
    date: album.date,
    venue: album.venue,
    location: album.location,
    order: album.order,
    photos: (album.photos || []).filter((p: any) => p.image).map((p: any) => ({
      src: urlFor(p.image).width(1800).auto('format').url(),
      alt: p.alt || album.title,
      caption: p.caption,
    })),
  }));
}

export async function getAlbum(slug: string): Promise<Album | null> {
  const albums = await client.fetch(`*[_type == "album" && slug.current == $slug][0]{
    _id, title, slug, category, coverImage, coverImageAlt, shortDescription, order,
    story, date, venue, location,
    photos[]{ image, alt, caption }
  }`, { slug });
  if (!albums) return null;
  return {
    _id: albums._id,
    slug: albums.slug?.current || slug,
    title: albums.title,
    category: albums.category,
    coverImage: albums.coverImage ? urlFor(albums.coverImage).width(1800).auto('format').url() : undefined,
    coverImageAlt: albums.coverImageAlt,
    story: albums.story || albums.shortDescription,
    date: albums.date,
    venue: albums.venue,
    location: albums.location,
    order: albums.order,
    photos: (albums.photos || []).filter((p: any) => p.image).map((p: any) => ({
      src: urlFor(p.image).width(1800).auto('format').url(),
      alt: p.alt || albums.title,
      caption: p.caption,
    })),
  };
}

export async function getHomePage(): Promise<{ seo?: any; sections: HomeSection[] } | null> {
  return client.fetch(`*[_type == "homePage" && _id == "homePage"][0]{
    seo{ metaTitle, metaDescription, ogImage },
    sections[]{
      ...,
      _type == "galleryPreviewSection" => {
        featuredAlbums[]->{ _id, title, slug, category, coverImage, coverImageAlt, shortDescription, order, photos[]{ image, alt, caption } }
      }
    }
  }`);
}

export async function getPage(slug: string) {
  return client.fetch(`*[_type == "page" && slug.current == $slug][0]{
    _id, title, slug,
    seo{ metaTitle, metaDescription, ogImage },
    sections[]{
      ...,
      _type == "galleryPreviewSection" => {
        featuredAlbums[]->{ _id, title, slug, category, coverImage, coverImageAlt, shortDescription, order, photos[]{ image, alt, caption } }
      }
    }
  }`, { slug });
}
