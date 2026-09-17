interface MarqueeBannerProps {
  items: string[];
  className?: string;
  /** Seconds per loop, default 30 */
  duration?: number;
}

function MarqueeSequence({ items, ariaHidden }: { items: string[]; ariaHidden: boolean }) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {[...items, ...items, ...items].map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 text-xs font-semibold uppercase tracking-[0.25em] text-cream">
            {item}
          </span>
          <span className="text-xs text-cream/40">✦</span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeBanner({ items, className = "", duration = 30 }: MarqueeBannerProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`marquee overflow-hidden bg-primary py-3 ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
        <MarqueeSequence items={items} ariaHidden={false} />
        <MarqueeSequence items={items} ariaHidden={true} />
      </div>
    </div>
  );
}
