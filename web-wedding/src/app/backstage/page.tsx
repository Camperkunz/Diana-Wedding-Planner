import type { Metadata } from 'next';
import { getBackstagePage, getBackstageVideos, buildSeoMetadata } from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';
import { getEmbedUrl, getAutoThumbnail } from '@/lib/video-embed';
import BackstageClient, { Video } from './backstage-client';
import { JsonLd } from '@/components/json-ld';
import { BUSINESS_ID, breadcrumbList } from '@/lib/structured-data';

const fallback = {};

// ISR: new backstage videos edited in the Studio appear within this window.
export const revalidate = 21600;

// This route had no metadata of its own, so it inherited nothing useful:
// no canonical, no description beyond the root default, and no preview card.
export async function generateMetadata(): Promise<Metadata> {
    const page = await getBackstagePage();
    return buildSeoMetadata(
        page?.seo,
        'Backstage — Behind the Scenes | Diana, Ottawa Wedding Planner',
        'Behind the scenes of weddings planned by Diana: films, real celebrations and the details that never make it into the gallery.',
        '/backstage'
    );
}

export default async function BackstagePage() {
    const [page, videos] = await Promise.all([getBackstagePage(), getBackstageVideos()]);

    const c = {
        ...fallback,
        ...(page || {}),
    };

    const mapped: Video[] = await Promise.all(
        (videos || []).map(async (video: any, index: number) => {
            const manualThumbnail = video.thumbnail ? sanityImage(video.thumbnail) : undefined;
            const thumbnail = manualThumbnail || (await getAutoThumbnail(video.videoUrl)) || undefined;

            return {
                id: video._id || `backstage-${index}`,
                title: video.title || '',
                description: video.description || '',
                embedUrl: getEmbedUrl(video.videoUrl) || '',
                // Original URL: the client links to it when the video cannot be
                // embedded (SafeLink sanitises it there).
                videoUrl: video.videoUrl,
                thumbnail,
                thumbnailAlt: video.title || 'Video thumbnail',
            };
        })
    );

    // VideoObject per embeddable video. Google requires name, thumbnailUrl and
    // uploadDate, so a video missing one of them is left out of the markup.
    const videoJsonLd = mapped
        .map((video, index) => ({ video, createdAt: videos?.[index]?._createdAt }))
        .filter(({ video, createdAt }) => video.title && video.thumbnail && video.embedUrl && createdAt)
        .map(({ video, createdAt }) => ({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: video.title,
            description: video.description || video.title,
            thumbnailUrl: video.thumbnail,
            embedUrl: video.embedUrl,
            uploadDate: createdAt,
            publisher: { '@id': BUSINESS_ID },
        }));

    return (
        <>
        <JsonLd data={[breadcrumbList([['Home', '/'], ['Backstage', '/backstage']]), ...videoJsonLd]} />
        <BackstageClient
            content={{
                title: c.title,
                intro: c.intro,
                heroEyebrow: c.heroEyebrow,
                heroHeading: c.heroHeading,
                heroImage: c.heroImage ? sanityImage(c.heroImage) : c.heroImage,
                heroImageAlt: c.heroImageAlt,
                introText: c.introText,
                ctaHeading: c.ctaHeading,
                ctaButtonLabel: c.ctaButtonLabel,
                ctaButtonLink: c.ctaButtonLink,
            }}
            videos={mapped}
        />
        </>
    );
}