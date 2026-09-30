import React, { useMemo } from "react";
import { format, parseISO, subYears, subMonths, subWeeks } from "date-fns";
import { History, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DailyLogEntry } from "@/types/diary";

interface DiaryOnThisDayProps {
  entries: DailyLogEntry[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const DiaryOnThisDay: React.FC<DiaryOnThisDayProps> = ({
  entries,
  selectedDate,
  onSelectDate,
}) => {
  const currentDate = parseISO(selectedDate);

  // Check for entries matching 1 year, 6 months, 1 month, or 1 week ago
  const flashback = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    const oneYearAgoStr = format(subYears(currentDate, 1), "yyyy-MM-dd");
    const sixMonthsAgoStr = format(subMonths(currentDate, 6), "yyyy-MM-dd");
    const oneMonthAgoStr = format(subMonths(currentDate, 1), "yyyy-MM-dd");
    const oneWeekAgoStr = format(subWeeks(currentDate, 1), "yyyy-MM-dd");

    const matchOneYear = entries.find((e) => e.date === oneYearAgoStr);
    if (matchOneYear) return { label: "1 Year Ago Today", entry: matchOneYear };

    const matchSixMonths = entries.find((e) => e.date === sixMonthsAgoStr);
    if (matchSixMonths) return { label: "6 Months Ago Today", entry: matchSixMonths };

    const matchOneMonth = entries.find((e) => e.date === oneMonthAgoStr);
    if (matchOneMonth) return { label: "1 Month Ago Today", entry: matchOneMonth };

    const matchOneWeek = entries.find((e) => e.date === oneWeekAgoStr);
    if (matchOneWeek) return { label: "1 Week Ago Today", entry: matchOneWeek };

    return null;
  }, [entries, currentDate]);

  if (!flashback) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-secondary/30 relative overflow-hidden space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <History className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            On This Day · {flashback.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({format(parseISO(flashback.entry.date), "MMM d, yyyy")})
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectDate(flashback.entry.date)}
          className="h-7 text-xs text-primary hover:text-primary gap-1"
        >
          <span>Open Entry</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="p-3.5 rounded-xl bg-background/70 border border-border/60 text-xs text-foreground/85 leading-relaxed line-clamp-3 italic">
        "{flashback.entry.raw_content}"
      </div>
    </div>
  );
};

export default DiaryOnThisDay;
