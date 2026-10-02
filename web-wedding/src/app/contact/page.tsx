import ContactClient from './contact-client';
import {
    getSiteSettings,
    getSiteLayout,
    getContactPage,
    getServices,
    buildSeoMetadata
} from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';

export async function generateMetadata() {
    const page = await getContactPage();
    return buildSeoMetadata(page?.seo, 'Contact', page?.formDescription);
}

export default async function ContactPage() {
    const [page, settings, layout, services] = await Promise.all([
        getContactPage(),
        getSiteSettings(),
        getSiteLayout(),
        getServices(),
    ]);

    return (
        <ContactClient
            services={services}
            settings={{
                email: settings?.email || layout?.footerEmail,
                phone: settings?.phone || layout?.footerPhone,
                location: settings?.location,
                serviceArea: settings?.serviceArea || layout?.footerAddress,
                socialLinks: settings?.socialLinks?.length ? settings.socialLinks : layout?.footerSocialLinks || [],
            }}
            c={{
                ...page,
                heroImage: sanityImage(page?.heroImage),
            }}
        />
    );
}