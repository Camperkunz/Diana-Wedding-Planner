'use client';

import Link from 'next/link';
import { useState } from 'react';
import { withAutoplay } from '@/lib/video-embed';
import { LuArrowRight as ArrowRight, LuPlay as Play, LuX as X } from 'react-icons/lu';
import HeroSection from '@/components/ui/HeroSection';

export type Video = {
    id?: string;
    title: string;
    description?: string;
    embedUrl: string;
    thumbnail?: string;
    thumbnailAlt?: string;
};

export type Content = {
    title?: string;
    intro?: string;
    heroEyebrow?: string;
    heroHeading?: string;
    heroImage?: string;
    heroImageAlt?: string;
    introText?: string;
    ctaHeading?: string;
    ctaButtonLabel?: string;
    ctaButtonLink?: string;
};

export default function BackstageClient({
    content,
    videos,
}: {
    content: Content;
    videos: Video[];
}) {
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    return (
        <>
            {/* Hero Section */}
            <HeroSection
                eyebrow={content.heroEyebrow}
                heading={content.heroHeading}
                image={content.heroImage}
                imageAlt={content.heroImageAlt}
            />

            <section className="py-16 md:py-20 bg-background">
                <div className="container-narrow text-center">
                    <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                        {content.introText || content.intro}
                    </p>
                </div>
            </section>

            <section className="pb-28 md:pb-40 bg-background">
                <div className="container-wide">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {videos.map((video, i) => (
                            <article
                                key={video.id || i}
                                className="group cursor-pointer"
                                onClick={() => setActiveVideo(video.embedUrl)}
                            >
                                <div className="relative aspect-video overflow-hidden rounded-sm shadow-sm group-hover:shadow-xl transition-all duration-500">
                                    <img
                                        src={video.thumbnail || '/placeholder-thumb.jpg'}
                                        alt={video.thumbnailAlt || video.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-serif text-xl mt-5 group-hover:text-accent transition-colors duration-300">
                                    {video.title}
                                </h3>
                                {video.description && (
                                    <p className="text-muted-foreground text-sm mt-2 font-light leading-relaxed">
                                        {video.description}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {content.ctaHeading && content.ctaButtonLink && (
                <section className="py-24 md:py-32 bg-secondary/40">
                    <div className="container-narrow text-center">
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
                            {content.ctaHeading}
                        </h2>
                        <Link
                            href={content.ctaButtonLink}
                            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {content.ctaButtonLabel || 'Learn More'}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            )}

            {activeVideo && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setActiveVideo(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                        onClick={() => setActiveVideo(null)}
                        aria-label="Close video"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <div
                        className="w-full max-w-4xl aspect-video"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            src={withAutoplay(activeVideo)}
                            className="w-full h-full rounded-sm"
                            allow="autoplay; fullscreen; picture-in-picture"
                            title="Wedding video"
                        />
                    </div>
                </div>
            )}
        </>
    );
}