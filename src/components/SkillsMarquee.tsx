import { ALL_SKILLS, SkillItem } from "@/data/skills";

interface SkillsMarqueeProps {
  className?: string;
  speedSeconds?: number;
  items?: SkillItem[];
}

export const SkillsMarquee = ({
  className = "",
  speedSeconds = 35,
  items = ALL_SKILLS,
}: SkillsMarqueeProps) => {
  // Duplicate array once for seamless infinite loop from -50% to 0%
  const marqueeItems = [...items, ...items];

  return (
    <div
      className={`relative w-full overflow-hidden py-1 select-none ${className}`}
      aria-label="Skills Marquee"
    >
      {/* Soft gradient masks on left & right edges for seamless entry/exit */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Ticker track moving Left to Right */}
      <div
        className="animate-marquee-ltr flex items-center gap-2 sm:gap-2.5"
        style={{ "--marquee-duration": `${speedSeconds}s` } as React.CSSProperties}
      >
        {marqueeItems.map((skill, index) => {
          const Icon = skill.icon;
          return (
            <div
              key={`${skill.name}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/60 text-xs font-medium text-foreground transition-all duration-200 shrink-0 cursor-default group hover:border-primary/40 hover:scale-105"
            >
              <Icon
                size={13}
                className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
              />
              <span className="whitespace-nowrap">{skill.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsMarquee;
