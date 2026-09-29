import { getBackstagePage, getBackstageVideos } from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';
import { getEmbedUrl, getAutoThumbnail } from '@/lib/video-embed';
import BackstageClient, { Video } from './backstage-client';

const fallback = {};

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
                heroHeadingLine1: c.heroHeadingLine1,
                heroHeadingScript: c.heroHeadingScript,
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