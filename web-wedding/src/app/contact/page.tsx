import ContactClient from './contact-client';
import {
    getSiteSettings,
    getSiteLayout,
    getContactPage,
    getServices,
    getPrivacyPolicy,
    buildSeoMetadata
} from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';

// ISR: contact page copy edited in the Studio appears within this window.
// (The form itself is a server action — POST requests always bypass caches.)
export const revalidate = 1800;

export async function generateMetadata() {
    const page = await getContactPage();
    return buildSeoMetadata(page?.seo, 'Contact', page?.formDescription);
}

export default async function ContactPage() {
    const [page, settings, layout, services, privacy] = await Promise.all([
        getContactPage(),
        getSiteSettings(),
        getSiteLayout(),
        getServices(),
        getPrivacyPolicy(),
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
            // Version of the policy the consent checkbox refers to. Read from the
            // same Studio document the /privacy page renders, so the recorded
            // consent and the published text can never drift apart.
            policyLastUpdated={privacy?.lastUpdated}
            c={{
                ...page,
                heroImage: sanityImage(page?.heroImage),
            }}
        />
    );
}