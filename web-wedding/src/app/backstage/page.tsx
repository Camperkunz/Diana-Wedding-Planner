import type { Metadata } from 'next';
import { getBackstagePage, getBackstageVideos, buildSeoMetadata } from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';
import { getEmbedUrl, getAutoThumbnail } from '@/lib/video-embed';
import BackstageClient, { Video } from './backstage-client';

const fallback = {};

// ISR: new backstage videos edited in the Studio appear within this window.
export const revalidate = 1800;

// This route had no metadata of its own, so it inherited nothing useful:
// no canonical, no description beyond the root default, and no preview card.
export async function generateMetadata(): Promise<Metadata> {
    const page = await getBackstagePage();
    return buildSeoMetadata(
        page?.seo,
        'Backstage — Behind the Scenes | Diana, Ottawa Wedding Planner',
        'Behind the scenes of weddings planned by Diana: films, real celebrations and the details that never make it into the gallery.'
    );
}

export default async function BackstagePage() {
    const page = await getBackstagePage();
    const videos = await getBackstageVideos();

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
                thumbnail,
                thumbnailAlt: video.title || 'Video thumbnail',
            };
        })
    );

    return (
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
    );
}