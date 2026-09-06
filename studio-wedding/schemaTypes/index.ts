import { siteSettings } from './documents/siteSettings';
import { siteLayout } from './documents/siteLayout';
import { homePage } from './documents/homePage';
import { page } from './documents/page';
import { album } from './documents/album';

import { seo } from './objects/shared/seo';
import { button } from './objects/shared/button';
import { socialLink } from './objects/shared/socialLink';

import { heroSection } from './objects/sections/heroSection';
import { aboutSection } from './objects/sections/aboutSection';
import { galleryPreviewSection } from './objects/sections/galleryPreviewSection';
import { testimonialsSection } from './objects/sections/testimonialsSection';
import { ctaSection } from './objects/sections/ctaSection';
import { contactSection } from './objects/sections/contactSection';
import { sections } from './objects/sections';

export const schemaTypes = [
  // Documents
  siteSettings,
  siteLayout,
  homePage,
  page,
  album,

  // Shared objects
  seo,
  button,
  socialLink,

  // Section objects
  sections,
  heroSection,
  aboutSection,
  galleryPreviewSection,
  testimonialsSection,
  ctaSection,
  contactSection,
];
