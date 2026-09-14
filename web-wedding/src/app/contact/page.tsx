import ContactClient from './contact-client';
import { getSiteSettings, getSiteLayout, getContactPage, sanityImage, buildSeoMetadata } from '@/lib/sanity-data';

export async function generateMetadata() {
    const page = await getContactPage();
    return buildSeoMetadata(page?.seo, 'Contact', page?.formDescription);
}

export default async function ContactPage() {
    const [page, settings, layout] = await Promise.all([
        getContactPage(),
        getSiteSettings(),
        getSiteLayout(),
    ]);

    const targetEmail = page?.recipientEmail || settings?.email || layout?.footerEmail;

    return (
        <ContactClient
            recipientEmail={targetEmail}
            settings={{
                email: settings?.email || layout?.footerEmail,
                phone: settings?.phone || layout?.footerPhone,
                location: settings?.location,
                serviceArea: settings?.serviceArea || layout?.footerAddress,
                socialLinks: layout?.footerSocialLinks || settings?.socialLinks || [],
            }}
            content={{
                ...page,
                heroImage: sanityImage(page?.heroImage),
            }}
        />
    );
}