'use client';

import { useState, useTransition } from 'react';
import { loadAlbumPhotos } from '@/app/actions/albumPhotos';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { GALLERY_IMAGE_WIDTHS } from '@/lib/sanity-image';
import type { AlbumPhoto } from '@/lib/sanity-data';

export default function AlbumGallery({
  slug,
  initialPhotos,
  total,
}: {
  slug: string;
  initialPhotos: AlbumPhoto[];
  total: number;
}) {
  const [shown, setShown] = useState(initialPhotos);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const remaining = total - shown.length;

  const loadMore = () =>
    startTransition(async () => {
      try {
        const next = await loadAlbumPhotos(slug, shown.length);
        if (next.length === 0) return setFailed(true);
        setFailed(false);
        setShown((prev) => [...prev, ...next.filter((p) => !prev.some((q) => q.id === p.id))]);
      } catch {
        setFailed(true);
      }
    });

  return (
    <>
      {/* CSS multi-column masonry: every photo keeps its own aspect ratio. */}
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 lg:gap-8">
        {shown.map((photo) => (
          <figure
            key={photo.id}
            className="group relative mb-6 overflow-hidden rounded-sm shadow-sm break-inside-avoid cv-auto lg:mb-8"
            style={
              photo.width && photo.height
                ? { aspectRatio: `${photo.width} / ${photo.height}` }
                : undefined
            }
          >
            <ResponsiveImage
              source={photo.src}
              srcSet={photo.srcSet}
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              sizes="(min-width: 1024px) min(33vw, 24rem), (min-width: 640px) 50vw, 100vw"
              widths={GALLERY_IMAGE_WIDTHS}
              className="w-full h-auto"
            />
            {photo.caption && (
              <figcaption className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white text-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {remaining > 0 ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="inline-flex items-center gap-3 border border-accent text-accent px-10 py-3 text-sm uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-all duration-300 disabled:opacity-60"
          >
            {pending ? 'Loading…' : failed ? 'Try again' : `Load more (${remaining})`}
          </button>
        </div>
      ) : null}
    </>
  );
}
