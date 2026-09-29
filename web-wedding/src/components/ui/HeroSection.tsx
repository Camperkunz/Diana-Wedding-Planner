import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
    imageObjectPosition,
    sanityImage,
    sanityImageSrcSet,
    type ImageSource,
} from '@/lib/sanity-image';

/**
 * The single hero used by every page of the site.
 *
 * All hero sections render through this component so height, overlay, photo
 * treatment, typography and image loading stay identical:
 *
 *  - `size="fullscreen"` — homepage statement hero (100vh + call-to-action buttons),
 *  - `size="banner"`     — compact banner used on every inner page.
 *
 * Photos are sanitised (`sanityImage` → `safeImageSrc`), served responsively through
 * `srcSet`, blurred the same way everywhere and requested without a referrer so the
 * page URL is not leaked to the image CDN. When a photo is missing or unusable, the
 * gradient overlay still keeps the heading readable on the dark base colour.
 */

type HeroSize = 'fullscreen' | 'banner';

type HeroStyles = {
    section: string;
    eyebrow: string;
    heading: string;
    description: string;
    actions: string;
};

const HERO_STYLES: Record<HeroSize, HeroStyles> = {
    fullscreen: {
        section: 'h-screen min-h-[600px]',
        eyebrow: 'mb-6',
        heading: 'text-5xl md:text-7xl lg:text-8xl leading-[1.1] max-w-4xl',
        description: 'mt-8 max-w-2xl',
        actions: 'mt-12',
    },
    banner: {
        section: 'h-[10vh] md:h-[20vh] min-h-[300px] md:min-h-[350px] max-h-[450px]',
        eyebrow: 'mb-3',
        heading: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight',
        description: 'mt-6 max-w-2xl',
        actions: 'mt-10',
    },
};

/**
 * Turns the authored heading into inline nodes, switching every `*word*` to the script font.
 *
 * The heading stays one plain-text `<h1>`: the asterisks live only in the CMS, are stripped
 * before render, and an unmatched asterisk stays literal text so a typo can never swallow the
 * sentence. Nothing here positions or splits the words — the `<h1>` wraps them naturally, so any
 * sentence and any number of highlighted words lays itself out.
 */
export function buildHeading(heading?: string | null): ReactNode {
    const sentence = heading?.replace(/\s+/g, ' ').trim();
    if (!sentence) return null;

    return sentence.split(/(\*[^*]+\*)/g).map((part, index) =>
        part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
            <span key={`hero-script-${index}`} className="font-script font-normal">
                {part.slice(1, -1)}
            </span>
        ) : (
            part
        )
    );
}

type HeroSectionProps = {
    eyebrow?: string | null;
    heading?: string | null;
    description?: string | null;
    /** Raw Sanity image object or an already-built image URL. */
    image?: ImageSource;
    imageAlt?: string | null;
    size?: HeroSize;
    /** Set to `false` for a hero that is not above the fold. */
    priority?: boolean;
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
};

export default function HeroSection({
    eyebrow,
    heading,
    description,
    image,
    imageAlt,
    size = 'banner',
    priority = true,
    actions,
    children,
    className,
}: HeroSectionProps) {
    const styles = HERO_STYLES[size];
    const headingContent = buildHeading(heading);

    return (
        <section className={cn('relative w-full overflow-hidden bg-foreground', styles.section, className)}>
            <HeroBackground image={image} imageAlt={imageAlt} priority={priority} />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-10 pt-20">
                {eyebrow ? (
                    <p className={cn('text-white/80 text-xs md:text-sm uppercase tracking-wide-lg', styles.eyebrow)}>
                        {eyebrow}
                    </p>
                ) : null}

                {headingContent ? (
                    <h1 className={cn('font-serif text-white font-normal text-balance', styles.heading)}>
                        {headingContent}
                    </h1>
                ) : null}

                {description ? (
                    <p className={cn('text-white/90 text-base md:text-lg font-light leading-relaxed', styles.description)}>
                        {description}
                    </p>
                ) : null}

                {actions ? (
                    <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto', styles.actions)}>
                        {actions}
                    </div>
                ) : null}

                {children}
            </div>
        </section>
    );
}

type HeroBackgroundProps = {
    image?: ImageSource;
    imageAlt?: string | null;
    /** `true` (default) for above-the-fold heroes: eager load + high fetch priority. */
    priority?: boolean;
    /** Overrides the shared hero gradient when a band needs a slightly different one. */
    overlayClassName?: string;
};

/**
 * Shared full-bleed photo + overlay used by every hero (and by the homepage CTA band).
 * Renders the overlay only when the photo is missing or unsafe, so text stays readable
 * and the browser never requests an empty `src`.
 */
export function HeroBackground({
    image,
    imageAlt,
    priority = true,
    overlayClassName,
}: HeroBackgroundProps) {
    const src = sanityImage(image, 1920);
    const srcSet = sanityImageSrcSet(image);
    const objectPosition = imageObjectPosition(image);

    return (
        <div className="absolute inset-0 bg-foreground">
            {src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={src}
                    srcSet={srcSet}
                    sizes="100vw"
                    alt={imageAlt || ''}
                    style={objectPosition ? { objectPosition } : undefined}
                    className="w-full h-full object-cover blur-[2px] scale-105"
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    decoding="async"
                    referrerPolicy="no-referrer"
                />
            ) : null}

            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-accent/30',
                    overlayClassName
                )}
            />
        </div>
    );
}