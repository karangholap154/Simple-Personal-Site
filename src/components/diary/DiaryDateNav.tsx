import React, { useState } from "react";
import { format, parseISO, subDays, addDays, isToday, isYesterday, isAfter, startOfToday } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DailyLogEntry } from "@/types/diary";

interface DiaryDateNavProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  entries: DailyLogEntry[];
  selectedDateEntry: DailyLogEntry | null;
  draftLastSaved: Date | null;
  hasUnsavedChanges?: boolean;
}

export const DiaryDateNav: React.FC<DiaryDateNavProps> = ({
  selectedDate,
  onSelectDate,
  entries,
  selectedDateEntry,
  draftLastSaved,
  hasUnsavedChanges = false,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const currentDate = parseISO(selectedDate);
  const isSelectedToday = isToday(currentDate);
  const isSelectedYesterday = isYesterday(currentDate);

  // Set of dates that have entries for quick lookup
  const entryDateSet = React.useMemo(() => {
    return new Set(entries.map((e) => e.date));
  }, [entries]);

  // Navigate back 1 day
  const handlePrevDay = () => {
    const prev = subDays(currentDate, 1);
    onSelectDate(format(prev, "yyyy-MM-dd"));
  };

  // Navigate forward 1 day (up to today)
  const handleNextDay = () => {
    if (isSelectedToday) return;
    const next = addDays(currentDate, 1);
    onSelectDate(format(next, "yyyy-MM-dd"));
  };

  // Jump to today
  const handleJumpToToday = () => {
    onSelectDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Jump to yesterday
  const handleJumpToYesterday = () => {
    onSelectDate(format(subDays(new Date(), 1), "yyyy-MM-dd"));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs shadow-xs">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Previous Day */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevDay}
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 border-border/80"
          title="Previous Day (Arrow Left)"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Date Picker Popover */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 px-3 text-xs font-medium border-border/80 bg-background/60 hover:bg-secondary/60"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>{format(currentDate, "EEE, MMM d, yyyy")}</span>
              {isSelectedToday && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium border border-primary/20">
                  Today
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => {
                if (date) {
                  onSelectDate(format(date, "yyyy-MM-dd"));
                  setCalendarOpen(false);
                }
              }}
              disabled={(date) => isAfter(date, startOfToday())}
              modifiers={{
                hasEntry: (date) => entryDateSet.has(format(date, "yyyy-MM-dd")),
              }}
              modifiersClassNames={{
                hasEntry: "font-bold underline decoration-primary decoration-2 underline-offset-4",
              }}
              initialFocus
            />
            <div className="p-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Underlined dates have entries
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={() => {
                  handleJumpToToday();
                  setCalendarOpen(false);
                }}
              >
                Today
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Next Day */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          disabled={isSelectedToday}
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 border-border/80 disabled:opacity-30"
          title="Next Day (Arrow Right)"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Quick Jump Buttons */}
        {!isSelectedToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleJumpToToday}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2.5"
          >
            Jump to Today
          </Button>
        )}
        {!isSelectedYesterday && !isSelectedToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleJumpToYesterday}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2.5 hidden md:inline-flex"
          >
            Yesterday
          </Button>
        )}
      </div>

      {/* Sync Status Badge */}
      <div className="flex items-center gap-2 text-xs self-start sm:self-center">
        {selectedDateEntry && !hasUnsavedChanges ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved in Cloud
          </span>
        ) : selectedDateEntry && hasUnsavedChanges ? (
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px]">
            <RotateCcw className="w-3.5 h-3.5" />
            Unsaved Changes (Draft saved)
          </span>
        ) : draftLastSaved ? (
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px]">
            <RotateCcw className="w-3.5 h-3.5" />
            Draft saved locally ({format(draftLastSaved, "h:mm a")})
          </span>
        ) : (
          <span className="text-muted-foreground text-[11px] px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50">
            Unwritten Day
          </span>
        )}
      </div>
    </div>
  );
};

export default DiaryDateNav;
