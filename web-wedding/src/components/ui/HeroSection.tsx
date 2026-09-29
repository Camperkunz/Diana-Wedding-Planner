type HeroSectionProps = {
    eyebrow?: string;
    headingLine1?: string;
    headingScript?: string;
    headingLine2?: string;
    image?: any;
    imageAlt?: string;
};

export default function HeroSection({
    eyebrow,
    headingLine1,
    headingScript,
    headingLine2,
    image,
    imageAlt,
}: HeroSectionProps) {
    return (
        <section className="relative h-[10vh] md:h-[20vh] min-h-[300px] md:min-h-[350px] max-h-[450px] w-full overflow-hidden">
            <div className="absolute inset-0">
                {image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={image}
                        alt={imageAlt || ''}
                        className="w-full h-full object-cover blur-[2px] scale-105"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-accent/30" />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
                {eyebrow && (
                    <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-2">
                        {eyebrow}
                    </p>
                )}

                <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
                    {headingLine1}{' '}
                    {headingScript && (
                        <span className="font-script font-normal">{headingScript}</span>
                    )}
                    {headingLine2 && <> {headingLine2}</>}
                </h1>
            </div>
        </section>
    );
}