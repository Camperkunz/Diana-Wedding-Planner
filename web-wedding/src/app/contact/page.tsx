import ContactClient from './contact-client';
import { getSiteSettings, getSiteLayout } from '@/lib/sanity-data';

export default async function ContactPage() {
  const [settings, layout] = await Promise.all([getSiteSettings(), getSiteLayout()]);
  return <ContactClient settings={{
    email: layout?.footerEmail || settings?.email,
    phone: layout?.footerPhone || settings?.phone,
    location: settings?.location,
    serviceArea: settings?.serviceArea || layout?.footerAddress,
    socialLinks: layout?.footerSocialLinks || settings?.socialLinks || [],
  }} />;
}
