import { siteSettings } from './documents/siteSettings';
import { siteLayout } from './documents/siteLayout';
import { homePage } from './documents/homePage';
import { album } from './documents/album';
import { service } from './documents/service';
import { siteDesign } from './documents/siteDesign';
import { aboutPage } from './documents/aboutPage';
import { servicesPage } from './documents/servicesPage';
import { portfolioPage } from './documents/portfolioPage';
import { faqPage } from './documents/faqPage';
import { backstagePage } from './documents/backstagePage';
import { contactPage } from './documents/contactPage';
import backstageVideo from './documents/backstageVideo'

import { seo } from './objects/shared/seo';
import { button } from './objects/shared/button';
import { socialLink } from './objects/shared/socialLink';


export const schemaTypes = [
  // Documents
  siteSettings,
  siteLayout,
  homePage,
  album,
  service,
  siteDesign,
  aboutPage,
  servicesPage,
  portfolioPage,
  faqPage,
  backstagePage,
  contactPage,
  backstageVideo,
  // Shared objects
  seo,
  button,
  socialLink,

];
