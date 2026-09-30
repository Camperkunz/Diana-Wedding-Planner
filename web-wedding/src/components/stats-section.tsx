export type StatItem = {
  value: string;
  label: string;
};

type StatsSectionProps = {
  stats?: StatItem[];
  className?: string;
  valueClassName?: string;
};

// Shared by the homepage and the About page. Renders nothing when there are
// no stats entered in Sanity — same hide-if-empty pattern as TestimonialsSection.
export function StatsSection({
  stats,
  className = 'bg-secondary/50 py-12 md:py-16',
  valueClassName = 'font-serif text-5xl md:text-6xl text-accent mb-4',
}: StatsSectionProps) {
  if (!stats?.length) return null;

  return (
    <section className={className}>
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className={valueClassName}>{stat.value}</p>
              <p className="text-sm uppercase tracking-wide text-muted-foreground font-light">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
