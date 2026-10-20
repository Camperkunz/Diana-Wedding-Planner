'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { withAutoplay } from '@/lib/video-embed';
import { LuArrowRight as ArrowRight, LuPlay as Play, LuX as X } from 'react-icons/lu';
import HeroSection from '@/components/ui/HeroSection';
import SafeLink from '@/components/ui/SafeLink';

export type Video = {
    id?: string;
    title: string;
    description?: string;
    /** Embeddable URL; empty when the link could not be recognised. */
    embedUrl: string;
    /** Original link from the CMS — used when the video cannot be embedded. */
    videoUrl?: string;
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
    const lastFocusedRef = useRef<HTMLElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const openVideo = (embedUrl: string) => {
        lastFocusedRef.current = document.activeElement as HTMLElement | null;
        setActiveVideo(embedUrl);
    };

    const closeVideo = () => {
        setActiveVideo(null);
        lastFocusedRef.current?.focus();
    };

    // Modal a11y: Esc closes, focus moves into the dialog and Tab stays on the
    // close button (the iframe is the only other focus target), page scroll locked.
    useEffect(() => {
        if (!activeVideo) return;
        closeButtonRef.current?.focus();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeVideo();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVideo]);

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
                        {videos.map((video, i) => {
                            const card = (
                                <>
                                    <div className="relative aspect-video overflow-hidden rounded-sm shadow-sm group-hover:shadow-xl transition-all duration-500">
                                        {/* No thumbnail → a neutral panel, not the old
                                            `/placeholder-thumb.jpg` (no public/ file, so it
                                            rendered a broken image). */}
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.thumbnailAlt || video.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full bg-gradient-to-br from-foreground to-foreground/70"
                                                aria-hidden="true"
                                            />
                                        )}
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
                                </>
                            );

                            // A link we can embed → click opens the player modal. An
                            // unrecognised URL would produce a blank iframe (the video
                            // host or the CSP `frame-src` refuses to be framed), so the
                            // card links out to the original page instead.
                            if (video.embedUrl) {
                                return (
                                    <article
                                        key={video.id || i}
                                        className="group cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                        aria-haspopup="dialog"
                                        aria-label={`Play video: ${video.title}`}
                                        onClick={() => openVideo(video.embedUrl)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                openVideo(video.embedUrl);
                                            }
                                        }}
                                    >
                                        {card}
                                    </article>
                                );
                            }

                            if (video.videoUrl) {
                                return (
                                    <SafeLink key={video.id || i} href={video.videoUrl} className="group block">
                                        {card}
                                    </SafeLink>
                                );
                            }

                            return (
                                <article key={video.id || i} className="group">
                                    {card}
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {content.ctaHeading && content.ctaButtonLink && (
                <section className="py-24 md:py-32 bg-secondary/40">
                    <div className="container-narrow text-center">
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
                            {content.ctaHeading}
                        </h2>
                        <Link prefetch={false} 
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
                    role="dialog"
                    aria-modal="true"
                    aria-label="Video player"
                    onClick={closeVideo}
                >
                    <button
                        ref={closeButtonRef}
                        className="absolute top-6 right-6 p-2 text-white/80 hover:text-white transition-colors"
                        onClick={closeVideo}
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