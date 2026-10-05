import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Flame,
  BookOpen,
  Lock,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  ShieldCheck,
  Brain,
  Feather,
  Zap,
  GraduationCap,
  Briefcase,
  BarChart2,
  Smile,
  Cpu,
} from "lucide-react";
import { format, subDays, startOfWeek, addDays, subWeeks, parseISO, isAfter } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayOfWeekCount {
  day: string;
  count: number;
}

interface PublicDiaryPulseData {
  dates: string[];
  total_entries: number;
  latest_date: string | null;
  tags: string[];
  total_work_hours?: number;
  total_learning_hours?: number;
  total_focus_hours?: number;
  average_mood?: number;
  dow_counts?: DayOfWeekCount[];
}

interface DiaryPublicPulseProps {
  onOpenAuth: () => void;
}

export const DiaryPublicPulse: React.FC<DiaryPublicPulseProps> = ({ onOpenAuth }) => {
  // Fetch live diary pulse from Supabase RPC
  const { data: pulse, isLoading, error } = useQuery<PublicDiaryPulseData>({
    queryKey: ["public-diary-pulse"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_diary_pulse");
      if (error) throw error;
      return (data as PublicDiaryPulseData) || { dates: [], total_entries: 0, latest_date: null, tags: [] };
    },
    staleTime: 1000 * 60 * 5,
  });

  // Compute live streak and date set
  const { streak, datesSet, latestFormatted } = useMemo(() => {
    const dates = pulse?.dates || [];
    const set = new Set(dates);

    let currentStreak = 0;
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    let checkDate = today;
    // If today hasn't been logged yet, allow yesterday to continue the streak
    if (!set.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }

    while (set.has(format(checkDate, "yyyy-MM-dd"))) {
      currentStreak += 1;
      checkDate = subDays(checkDate, 1);
    }

    let formattedLatest = "No entries yet";
    if (pulse?.latest_date) {
      try {
        formattedLatest = format(parseISO(pulse.latest_date), "MMM d, yyyy");
      } catch {
        formattedLatest = pulse.latest_date;
      }
    }

    return {
      streak: currentStreak,
      datesSet: set,
      latestFormatted: formattedLatest,
    };
  }, [pulse]);

  // Construct 52 weeks (1 full year) of calendar days for the habit heatmap
  const { weeks, monthPositions } = useMemo(() => {
    const totalWeeks = 52;
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const gridStart = subWeeks(currentWeekStart, totalWeeks - 1);

    const generatedWeeks: { date: Date; dateStr: string; hasEntry: boolean; isFuture: boolean }[][] = [];
    const positions: { name: string; startWeek: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = addDays(gridStart, w * 7);
      const weekDays = [];

      // Detect month change for header label
      const month = weekStart.getMonth();
      if (month !== lastMonth) {
        const prevStartWeek = positions[positions.length - 1]?.startWeek;
        // Avoid crowded labels if months are within 2 weeks of each other
        if (prevStartWeek === undefined || w - prevStartWeek >= 3) {
          positions.push({
            name: format(weekStart, "MMM"),
            startWeek: w,
          });
          lastMonth = month;
        }
      }

      for (let d = 0; d < 7; d++) {
        const dayDate = addDays(weekStart, d);
        const dateStr = format(dayDate, "yyyy-MM-dd");
        const isFuture = isAfter(dayDate, today);
        const hasEntry = datesSet.has(dateStr);

        weekDays.push({
          date: dayDate,
          dateStr,
          hasEntry,
          isFuture,
        });
      }
      generatedWeeks.push(weekDays);
    }

    return { weeks: generatedWeeks, monthPositions: positions };
  }, [datesSet]);

  // Focus & Consistency metrics
  const {
    totalFocusHours,
    workHours,
    learningHours,
    workPercent,
    learningPercent,
    averageMood,
    dowCounts,
    maxDowCount,
  } = useMemo(() => {
    const focus = Number(pulse?.total_focus_hours) || 0;
    const work = Number(pulse?.total_work_hours) || 0;
    const learning = Number(pulse?.total_learning_hours) || 0;
    const workPct = focus > 0 ? Math.round((work / focus) * 100) : 0;
    const learningPct = focus > 0 ? 100 - workPct : 0;
    const mood = Number(pulse?.average_mood) || 0;
    const dows = pulse?.dow_counts || [
      { day: "Sun", count: 0 },
      { day: "Mon", count: 0 },
      { day: "Tue", count: 0 },
      { day: "Wed", count: 0 },
      { day: "Thu", count: 0 },
      { day: "Fri", count: 0 },
      { day: "Sat", count: 0 },
    ];
    const maxCount = Math.max(...dows.map((d) => d.count), 1);

    return {
      totalFocusHours: focus,
      workHours: work,
      learningHours: learning,
      workPercent: workPct,
      learningPercent: learningPct,
      averageMood: mood,
      dowCounts: dows,
      maxDowCount: maxCount,
    };
  }, [pulse]);

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Hero / Introduction Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Live Reflection Pulse</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Nightly Reflection & Life Audit
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              This journal is my dedicated evening sanctuary for raw thoughts, daily engineering progress, and life reflections. While personal entries are cryptographically protected by database row-level security, my journaling habit and consistency are live.
            </p>
          </div>

          {/* Quick Access to Owner Login */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Button
              onClick={onOpenAuth}
              variant="outline"
              size="sm"
              className="h-10 px-4 text-xs font-medium gap-2 border-border/80 hover:bg-secondary/80 hover:border-primary/40 transition-colors shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Sanctuary Access</span>
            </Button>
            <p className="text-[10px] text-muted-foreground/70 text-center">
              Private to owner
            </p>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-border/50">
          <div className="p-4 rounded-2xl border border-border/60 bg-secondary/40 backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Current Streak
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <div className="text-xl font-bold text-foreground flex items-baseline gap-1 font-mono">
                  <span>{streak}</span>
                  <span className="text-xs font-normal text-muted-foreground font-sans">
                    {streak === 1 ? "day" : "days"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-secondary/40 backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Reflections
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <div className="text-xl font-bold text-foreground flex items-baseline gap-1 font-mono">
                  <span>{pulse?.total_entries ?? 0}</span>
                  <span className="text-xs font-normal text-muted-foreground font-sans">entries</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-secondary/40 backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Latest Entry
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <div className="text-sm font-semibold text-foreground">
                  {latestFormatted}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Habit Heatmap Section - Perfectly Aligned 52 Weeks */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-8 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">Reflection Consistency Heatmap</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Live 52-week activity grid showing every evening journal entry recorded in PostgreSQL.
            </p>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        {isLoading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-border bg-secondary/20 text-xs text-muted-foreground">
            Could not load reflection heatmap. Please refresh or try again later.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto scrollbar-none pb-2 pt-1">
              <div className="inline-block min-w-full">
                {/* Month Labels Row - Exact Offset Aligned with Week Columns */}
                <div className="flex items-center mb-2">
                  {/* Left Spacer matching day label width (w-8 = 32px) */}
                  <div className="w-8 shrink-0" />
                  
                  {/* Month labels positioned at startWeek * 14px (11px square + 3px gap) */}
                  <div className="relative h-4 flex-1">
                    {monthPositions.map((pos) => (
                      <span
                        key={`${pos.name}-${pos.startWeek}`}
                        className="absolute text-xs text-muted-foreground font-medium select-none"
                        style={{ left: `${pos.startWeek * 14}px` }}
                      >
                        {pos.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Grid Container with Left Day Labels & Week Columns */}
                <div className="flex items-start">
                  {/* Day-of-week labels on the left: exactly 11px per row with 3px gap */}
                  <div className="w-8 shrink-0 flex flex-col gap-[3px] text-[10px] text-muted-foreground font-medium select-none pr-1.5">
                    <div className="h-[11px]" />
                    <div className="h-[11px] flex items-center leading-none">Mon</div>
                    <div className="h-[11px]" />
                    <div className="h-[11px] flex items-center leading-none">Wed</div>
                    <div className="h-[11px]" />
                    <div className="h-[11px] flex items-center leading-none">Fri</div>
                    <div className="h-[11px]" />
                  </div>

                  {/* 52 Week Columns (11px width, 3px gap) */}
                  <div className="flex gap-[3px]">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[3px]">
                        {week.map((day) => {
                          if (day.isFuture) {
                            return (
                              <div
                                key={day.dateStr}
                                className="w-[11px] h-[11px] rounded-sm bg-transparent pointer-events-none"
                              />
                            );
                          }

                          const hasEntry = day.hasEntry;

                          return (
                            <Tooltip key={day.dateStr} delayDuration={80}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-[11px] h-[11px] rounded-sm transition-transform hover:scale-125 cursor-pointer ${
                                    hasEntry
                                      ? "bg-emerald-500 dark:bg-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-400 shadow-xs shadow-emerald-500/40"
                                      : "bg-contribution-0 border border-border/40 hover:border-foreground/40"
                                  }`}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs font-sans shadow-lg">
                                <div className="font-semibold text-foreground">
                                  {format(day.date, "EEEE, MMMM d, yyyy")}
                                </div>
                                <div className="text-muted-foreground text-[11px] mt-0.5">
                                  {hasEntry ? "✨ Evening reflection logged" : "No reflection recorded"}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Legend & Live Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-3 border-t border-border/40">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{pulse?.total_entries ?? 0} total entries verified in PostgreSQL</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px]">Less</span>
                <div className="flex gap-[3px] items-center">
                  <div
                    className="w-[11px] h-[11px] rounded-sm bg-contribution-0 border border-border/40"
                    title="No entry"
                  />
                  <div
                    className="w-[11px] h-[11px] rounded-sm bg-emerald-500/40"
                    title="1 entry"
                  />
                  <div
                    className="w-[11px] h-[11px] rounded-sm bg-emerald-500 dark:bg-emerald-400 shadow-xs shadow-emerald-500/30"
                    title="Logged entry"
                  />
                </div>
                <span className="text-[11px]">More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deep Work & Focus Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Total Focus Hours & Learning vs Building Ratio */}
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-7 space-y-5 shadow-md flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Deep Work & Focus Ratio</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary">
                Live Audit
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Total engineering focus hours audited across evening reflections:
            </p>
          </div>

          <div className="space-y-4">
            {/* Total Focus Hours Banner */}
            <div className="flex items-baseline justify-between p-3.5 rounded-2xl bg-secondary/30 border border-border/50">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                Total Focus Logged
              </span>
              <div className="text-2xl font-bold font-mono text-foreground">
                {totalFocusHours.toFixed(1)} <span className="text-xs font-normal text-muted-foreground font-sans">hrs</span>
              </div>
            </div>

            {/* Split Progress Bar: Building vs Learning */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  Building ({workPercent}%)
                </span>
                <span className="font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Learning ({learningPercent}%)
                </span>
              </div>

              <div className="h-3 w-full bg-secondary/70 rounded-full overflow-hidden flex border border-border/50 p-0.5">
                <div
                  style={{ width: `${workPercent}%` }}
                  className="bg-primary h-full rounded-full transition-all"
                  title={`Building / Dev: ${workHours.toFixed(1)} hrs (${workPercent}%)`}
                />
                <div
                  style={{ width: `${learningPercent}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all ml-0.5"
                  title={`Research & Learning: ${learningHours.toFixed(1)} hrs (${learningPercent}%)`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
                <span>{workHours.toFixed(1)} hrs projects & dev</span>
                <span>{learningHours.toFixed(1)} hrs study & research</span>
              </div>
            </div>
          </div>

          {/* Average Evening Mood / Energy Index */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              Average Evening Mood
            </span>
            <span className="font-mono font-semibold text-foreground">
              {averageMood.toFixed(1)} / 10 <span className="text-muted-foreground font-sans font-normal text-[11px]">(Focused & Steady)</span>
            </span>
          </div>
        </div>

        {/* Right: Most Active Journaling Days (7-day Consistency Distribution) */}
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-7 space-y-5 shadow-md flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Weekly Reflection Pattern</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">7 Days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Consistency distribution showing which days reflections were recorded most:
            </p>
          </div>

          {/* 7-Day Mini Bar Chart */}
          <div className="flex items-end justify-between gap-2.5 h-28 pt-4 px-1">
            {dowCounts.map((item) => {
              const heightPercent = maxDowCount > 0 ? (item.count / maxDowCount) * 100 : 0;
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.count > 0 ? item.count : "-"}
                  </div>
                  <div className="w-full max-w-[28px] bg-secondary/50 rounded-md overflow-hidden flex items-end h-16 border border-border/40 p-0.5">
                    <div
                      style={{ height: `${Math.max(heightPercent, 12)}%` }}
                      className={`w-full rounded-xs transition-all ${
                        item.count > 0
                          ? "bg-emerald-500 dark:bg-emerald-400 group-hover:brightness-110 shadow-xs shadow-emerald-500/30"
                          : "bg-muted/40"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Explanatory footnote */}
          <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Verified across all logged entries</span>
            <span className="font-mono text-emerald-500 dark:text-emerald-400 font-medium">100% Habit Pulse</span>
          </div>
        </div>
      </div>

      {/* Dynamic Focus Topics / AI Tags Cloud */}
      {pulse && pulse.tags && pulse.tags.length > 0 && (
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-7 space-y-3.5 shadow-md">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Recent Reflection Focus Topics</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Key areas, projects, and themes automatically extracted by Groq AI during nightly journaling:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {pulse.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal px-2.5 py-1 rounded-lg bg-secondary/70 hover:bg-secondary border border-border/60 transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Journal Architecture & Philosophy Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Feather className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Your Words First</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Raw, unfiltered stream-of-consciousness writing. No rigid forms or mandatory prompts—just real evening contemplation.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">AI Nightly Coach</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Llama-3 via Groq extracts mood, estimated focus hours, wins, and tomorrow's top priority additively without altering the original text.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Row-Level Security</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Strict PostgreSQL RLS ensures raw journal entries are never indexed, public, or visible to anyone without authenticated credentials.
          </p>
        </div>
      </div>

      {/* Visitor Explore Footer */}
      <div className="p-6 rounded-2xl border border-border/70 bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <div className="text-sm font-semibold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Looking for my public work and projects?</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Explore my featured applications, open source contributions, and engineering experience.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button asChild variant="default" size="sm" className="text-xs h-9 gap-1.5">
            <Link to="/projects">
              <span>View Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="text-xs h-9">
            <Link to="/resume">Resume</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiaryPublicPulse;
