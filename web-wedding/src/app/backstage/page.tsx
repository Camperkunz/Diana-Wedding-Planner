'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Play, X } from 'lucide-react';
import { getVideos } from '@/lib/data';

export default function BackstagePage() {
  const videos = getVideos();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/19970594/pexels-photo-19970594.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Groom dipping bride under a floral arch at an outdoor wedding"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-accent/10" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">
            Backstage
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
            Behind the <span className="font-script font-normal">scenes</span>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container-narrow text-center">
          <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Short films and behind-the-scenes moments from weddings I&apos;ve planned.
            These are embedded from the videographers&apos; channels — press play to watch.
          </p>
        </div>
      </section>

      {/* Video Grid */}
      <section className="pb-28 md:pb-40 bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {videos.map((video) => (
              <article
                key={video.id}
                className="group cursor-pointer"
                onClick={() => setActiveVideo(video.embedUrl)}
              >
                <div className="relative aspect-video overflow-hidden rounded-sm shadow-sm group-hover:shadow-xl transition-all duration-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail}
                    alt={video.thumbnailAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                <p className="text-muted-foreground text-sm mt-2 font-light leading-relaxed">
                  {video.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-secondary/40">
        <div className="container-narrow text-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
            Ready to create your own story?
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Video Modal */}
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
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${activeVideo}?autoplay=1`}
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
