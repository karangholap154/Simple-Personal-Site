import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Star,
  Trash2,
  Search,
  BookOpen,
  MessageSquareQuote,
  Clock,
  Sparkles,
  Tag,
  Eye,
  Edit3,
  X,
  Filter,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Smile,
  Zap,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailyLogEntry, Mood } from "@/types/diary";
import { useToast } from "@/hooks/use-toast";

interface DiaryHistoryProps {
  entries: DailyLogEntry[];
  onSelectDateForEdit: (date: string) => void;
  onToggleStar: (entry: DailyLogEntry) => void;
  onDeleteEntry: (id: string, date: string) => void;
  onSwitchToWrite: () => void;
}

type ViewMode = "timeline" | "grid";
type FilterType = "all" | "starred" | "work" | "wins";
type SortOption = "newest" | "oldest" | "longest" | "work";

const MOOD_DATA: Record<Mood, { label: string; icon: string; style: string }> = {
  ecstatic: { label: "Ecstatic", icon: "✨", style: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  happy: { label: "Happy", icon: "😊", style: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  calm: { label: "Calm", icon: "🍃", style: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  neutral: { label: "Neutral", icon: "😐", style: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  tired: { label: "Tired", icon: "🥱", style: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  anxious: { label: "Anxious", icon: "⚡", style: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  frustrated: { label: "Frustrated", icon: "😤", style: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  down: { label: "Down", icon: "🌧️", style: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
};

export const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  entries,
  onSelectDateForEdit,
  onToggleStar,
  onDeleteEntry,
  onSwitchToWrite,
}) => {
  const { toast } = useToast();

  // Layout & Viewing state
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Reader Modal State
  const [readingEntryIndex, setReadingEntryIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Track expanded entries in timeline view (for long texts)
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Lifetime Archive Statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    let totalWords = 0;
    let totalWorkHours = 0;
    let starredCount = 0;
    let winsCount = 0;

    entries.forEach((e) => {
      if (e.raw_content) {
        totalWords += e.raw_content.trim().split(/\s+/).filter(Boolean).length;
      }
      totalWorkHours += Number(e.work_hours) || 0;
      if (e.is_starred) starredCount += 1;
      if (e.wins_and_good_news && e.wins_and_good_news.length > 0) winsCount += 1;
    });

    return { totalEntries, totalWords, totalWorkHours, starredCount, winsCount };
  }, [entries]);

  // Filter & Search & Sort pipeline
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    // 1. Primary Category Filter
    if (activeFilter === "starred") {
      result = result.filter((e) => e.is_starred);
    } else if (activeFilter === "work") {
      result = result.filter((e) => (Number(e.work_hours) || 0) > 0);
    } else if (activeFilter === "wins") {
      result = result.filter((e) => e.wins_and_good_news && e.wins_and_good_news.length > 0);
    }

    // 2. Mood Filter
    if (selectedMood !== "all") {
      result = result.filter((e) => e.mood === selectedMood);
    }

    // 3. Search Query (full text, tags, AI feedback, date, wins)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (entry) =>
          entry.raw_content.toLowerCase().includes(q) ||
          entry.date.includes(q) ||
          entry.tags?.some((t) => t.toLowerCase().includes(q)) ||
          entry.wins_and_good_news?.some((w) => w.toLowerCase().includes(q)) ||
          entry.struggles_and_bad_news?.some((s) => s.toLowerCase().includes(q)) ||
          entry.ai_coach_feedback?.toLowerCase().includes(q) ||
          entry.ai_summary?.toLowerCase().includes(q)
      );
    }

    // 4. Sort Order
    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOption === "longest") {
        const wordsA = a.raw_content ? a.raw_content.trim().split(/\s+/).length : 0;
        const wordsB = b.raw_content ? b.raw_content.trim().split(/\s+/).length : 0;
        return wordsB - wordsA;
      }
      if (sortOption === "work") {
        return (Number(b.work_hours) || 0) - (Number(a.work_hours) || 0);
      }
      return 0;
    });

    return result;
  }, [entries, activeFilter, selectedMood, searchQuery, sortOption]);

  // Group entries by Month & Year for the Timeline View
  const monthlyGroups = useMemo(() => {
    const groups: { monthKey: string; monthLabel: string; entries: DailyLogEntry[] }[] = [];
    const groupMap = new Map<string, DailyLogEntry[]>();

    filteredAndSortedEntries.forEach((entry) => {
      const dateObj = parseISO(entry.date);
      const key = format(dateObj, "yyyy-MM");
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(entry);
    });

    groupMap.forEach((entryList, key) => {
      const sampleDate = parseISO(entryList[0].date);
      groups.push({
        monthKey: key,
        monthLabel: format(sampleDate, "MMMM yyyy"),
        entries: entryList,
      });
    });

    return groups;
  }, [filteredAndSortedEntries]);

  // Reader Mode Active Entry
  const readingEntry = readingEntryIndex !== null ? filteredAndSortedEntries[readingEntryIndex] : null;

  const handleOpenReader = (entry: DailyLogEntry) => {
    const index = filteredAndSortedEntries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      setReadingEntryIndex(index);
    }
  };

  const handlePrevReader = useCallback(() => {
    if (readingEntryIndex !== null && readingEntryIndex > 0) {
      setReadingEntryIndex(readingEntryIndex - 1);
    }
  }, [readingEntryIndex]);

  const handleNextReader = useCallback(() => {
    if (readingEntryIndex !== null && readingEntryIndex < filteredAndSortedEntries.length - 1) {
      setReadingEntryIndex(readingEntryIndex + 1);
    }
  }, [readingEntryIndex, filteredAndSortedEntries.length]);

  // Keyboard navigation for Reader dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingEntryIndex === null) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevReader();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextReader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingEntryIndex, handlePrevReader, handleNextReader]);

  // Copy entry text to clipboard
  const handleCopyContent = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Your journal reflection has been copied.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setSelectedMood("all");
    setSortOption("newest");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || activeFilter !== "all" || selectedMood !== "all" || sortOption !== "newest";

  return (
    <div className="space-y-6">
      {/* 1. Archive Analytics & Milestone Bar */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-card/40 border border-border/70 hover:border-border/90 transition-all space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium tracking-wide uppercase">Entries</span>
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.totalEntries}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Authentic reflections</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card/40 border border-border/70 hover:border-border/90 transition-all space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium tracking-wide uppercase">Words</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.totalWords.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Lifelong written words</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card/40 border border-border/70 hover:border-border/90 transition-all space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium tracking-wide uppercase">Deep Work</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.totalWorkHours.toFixed(1)}h
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Building & code logged</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-card/40 border border-border/70 hover:border-border/90 transition-all space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium tracking-wide uppercase">Starred</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.starredCount}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Pivotal life memories</p>
          </div>
        </div>
      )}

      {/* 2. Search, Filter & View Mode Toolbar */}
      <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-card/30 border border-border/60">
        {/* Row 1: Search & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search past thoughts, Marathi/Hindi, bugs, tags, wins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 h-9 sm:h-10 text-xs sm:text-sm bg-background/60 border-border/70 rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Timeline vs Grid */}
          <div className="inline-flex items-center rounded-xl bg-secondary/50 p-1 border border-border/50 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "timeline"
                  ? "bg-background text-foreground shadow-xs border border-border/40 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Timeline Stream View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs border border-border/40 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Chips & Dropdowns */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 border-t border-border/40">
          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="text-xs h-7 sm:h-8 px-2.5 rounded-lg border-border/70"
            >
              All ({entries.length})
            </Button>
            <Button
              variant={activeFilter === "starred" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("starred")}
              className="text-xs h-7 sm:h-8 px-2.5 rounded-lg gap-1 border-border/70"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Starred ({stats.starredCount})</span>
            </Button>
            <Button
              variant={activeFilter === "work" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("work")}
              className="text-xs h-7 sm:h-8 px-2.5 rounded-lg gap-1 border-border/70"
            >
              <Briefcase className="w-3 h-3 text-emerald-400" />
              <span>Deep Work</span>
            </Button>
            <Button
              variant={activeFilter === "wins" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("wins")}
              className="text-xs h-7 sm:h-8 px-2.5 rounded-lg gap-1 border-border/70"
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Wins ({stats.winsCount})</span>
            </Button>
          </div>

          {/* Controls: Mood Filter & Sort Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mood Dropdown */}
            <div className="w-32 sm:w-36">
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="h-7 sm:h-8 text-xs bg-background/60 border-border/70 rounded-lg">
                  <Smile className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">All Moods</SelectItem>
                  {Object.entries(MOOD_DATA).map(([id, info]) => (
                    <SelectItem key={id} value={id}>
                      <span className="flex items-center gap-1.5">
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-36 sm:w-40">
              <Select value={sortOption} onValueChange={(val) => setSortOption(val as SortOption)}>
                <SelectTrigger className="h-7 sm:h-8 text-xs bg-background/60 border-border/70 rounded-lg">
                  <Clock className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="longest">Longest Written</SelectItem>
                  <SelectItem value="work">Most Work Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button if any applied */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 sm:h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Reset all search & filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="py-14 sm:py-20 text-center border border-dashed border-border/70 rounded-3xl space-y-3.5 bg-card/20 px-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground mx-auto shadow-inner">
            <BookOpen className="w-6 h-6 text-primary/80" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-foreground">
              {hasActiveFilters ? "No entries match your criteria" : "No entries recorded yet"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {hasActiveFilters
                ? "Try searching for another keyword, clearing the mood selection, or resetting the filter chips."
                : "Your raw nightly thoughts, Marathi/Hindi words, and daily reflections will be preserved here."}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button size="sm" variant="outline" onClick={handleResetFilters} className="text-xs h-8 px-4 gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          ) : (
            <Button size="sm" onClick={onSwitchToWrite} className="text-xs h-8 px-4 font-medium">
              Write today's entry
            </Button>
          )}
        </div>
      ) : viewMode === "timeline" ? (
        /* 4A. TIMELINE STREAM VIEW (Chronological with Monthly Groupings) */
        <div className="space-y-8 sm:space-y-10">
          {monthlyGroups.map((group) => (
            <section key={group.monthKey} className="space-y-5">
              {/* Month Header Banner */}
              <div className="flex items-center gap-3 sticky top-16 z-10 py-1.5 bg-background/90 backdrop-blur-md">
                <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-primary/90 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  {group.monthLabel}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Timeline Track with connected items */}
              <div className="relative pl-4 sm:pl-7 border-l-2 border-border/60 ml-2.5 sm:ml-4 space-y-6">
                {group.entries.map((entry) => {
                  const dateObj = parseISO(entry.date);
                  const wordCount = entry.raw_content ? entry.raw_content.trim().split(/\s+/).filter(Boolean).length : 0;
                  const readingTime = Math.max(1, Math.ceil(wordCount / 180));
                  const isLong = entry.raw_content.length > 360;
                  const isExpanded = Boolean(expandedEntries[entry.id]);
                  const moodInfo = entry.mood ? MOOD_DATA[entry.mood] : null;

                  return (
                    <article
                      key={entry.id}
                      className="relative p-4 sm:p-6 rounded-2xl border border-border/70 bg-card/40 hover:border-border/90 hover:bg-card/60 transition-all space-y-3.5 shadow-xs"
                    >
                      {/* Timeline Node Indicator on the line */}
                      <div
                        className={`absolute -left-[23px] sm:-left-[37px] top-5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-background flex items-center justify-center ${
                          entry.is_starred ? "bg-amber-400 ring-4 ring-amber-400/20" : "bg-primary/80 ring-2 ring-primary/20"
                        }`}
                      />

                      {/* Entry Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {format(dateObj, "EEEE, MMMM d, yyyy")}
                          </span>

                          {entry.is_starred && (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                              <Star className="w-3 h-3 fill-amber-400" />
                              Starred
                            </span>
                          )}

                          {moodInfo && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${moodInfo.style}`}
                            >
                              <span>{moodInfo.icon}</span>
                              <span className="capitalize">{moodInfo.label}</span>
                            </span>
                          )}

                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            • {wordCount} words (~{readingTime}m read)
                          </span>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="flex items-center gap-1 sm:gap-1.5 self-start sm:self-center shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReader(entry)}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                            title="Open in Distraction-Free Book Reader"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span className="hidden sm:inline">Read</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectDateForEdit(entry.date)}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                            title="Edit this entry in Writer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleStar(entry)}
                            className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                            title={entry.is_starred ? "Unstar Entry" : "Star Entry"}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                entry.is_starred ? "fill-amber-400 text-amber-400" : ""
                              }`}
                            />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete your entry for{" "}
                                  <strong className="text-foreground">
                                    {format(dateObj, "EEEE, MMMM d, yyyy")}
                                  </strong>
                                  ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteEntry(entry.id, entry.date)}
                                  className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Yes, Delete Entry
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* HERO ELEMENT: Authentic Words with Expandable Preview */}
                      <div className="space-y-2">
                        <div
                          className={`text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans break-words ${
                            isLong && !isExpanded ? "line-clamp-4 relative" : ""
                          }`}
                        >
                          {entry.raw_content}
                        </div>

                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(entry.id)}
                            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 pt-0.5"
                          >
                            {isExpanded ? (
                              <>
                                <span>Show less</span>
                                <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>Show full entry</span>
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Wins & Good News Highlights (if any) */}
                      {entry.wins_and_good_news && entry.wins_and_good_news.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-500/90 space-y-1">
                          <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            Wins & Highlights:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-foreground/80 pl-1">
                            {entry.wins_and_good_news.map((win, idx) => (
                              <li key={idx} className="leading-snug">
                                {win}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Nightly Reflection Stoic Feedback */}
                      {entry.ai_coach_feedback && (
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground italic flex items-start gap-2.5">
                          <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>"{entry.ai_coach_feedback}"</span>
                        </div>
                      )}

                      {/* Badges Footer: Hours, Mood, Energy & Tags */}
                      {(entry.work_hours > 0 ||
                        entry.learning_hours > 0 ||
                        entry.unplanned_hours > 0 ||
                        entry.energy_level ||
                        (entry.tags && entry.tags.length > 0)) && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex-wrap">
                          {entry.work_hours > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary/80 border border-border flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-emerald-400" />
                              <span>Work: {entry.work_hours}h</span>
                            </span>
                          )}
                          {entry.learning_hours > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary/80 border border-border flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-primary" />
                              <span>Learning: {entry.learning_hours}h</span>
                            </span>
                          )}
                          {entry.unplanned_hours > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary/80 border border-border text-amber-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Lost: {entry.unplanned_hours}h</span>
                            </span>
                          )}
                          {entry.energy_level && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary/80 border border-border capitalize flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>{entry.energy_level.replace("_", " ")}</span>
                            </span>
                          )}
                          {entry.tags && entry.tags.length > 0 && (
                            <span className="text-[10px] text-muted-foreground/80 font-mono ml-auto flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {entry.tags.map((t) => `#${t}`).join(" ")}
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* 4B. COMPACT GRID VIEW (Fast Visual Scanning) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAndSortedEntries.map((entry) => {
            const dateObj = parseISO(entry.date);
            const wordCount = entry.raw_content ? entry.raw_content.trim().split(/\s+/).filter(Boolean).length : 0;
            const moodInfo = entry.mood ? MOOD_DATA[entry.mood] : null;

            return (
              <article
                key={entry.id}
                className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/40 hover:border-border hover:bg-card/60 transition-all flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {format(dateObj, "EEEE, MMM d, yyyy")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{wordCount} words</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {moodInfo && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-md border font-medium ${moodInfo.style}`}
                          title={`Mood: ${moodInfo.label}`}
                        >
                          {moodInfo.icon}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStar(entry)}
                        className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                        title="Star entry"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            entry.is_starred ? "fill-amber-400 text-amber-400" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Truncated Raw Words */}
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground/85 line-clamp-4 font-sans break-words">
                    {entry.raw_content}
                  </p>

                  {/* Highlight pill */}
                  {entry.ai_coach_feedback && (
                    <div className="p-2 rounded-lg bg-secondary/50 border border-border/50 text-[11px] text-muted-foreground italic line-clamp-2">
                      "{entry.ai_coach_feedback}"
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {entry.work_hours > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px]">
                        💼 {entry.work_hours}h
                      </span>
                    )}
                    {entry.learning_hours > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px]">
                        📚 {entry.learning_hours}h
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenReader(entry)}
                      className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectDateForEdit(entry.date)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 5. DISTRACTION-FREE BOOK READER DIALOG */}
      {readingEntry && (
        <Dialog open={Boolean(readingEntry)} onOpenChange={(open) => !open && setReadingEntryIndex(null)}>
          <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-7 space-y-5 rounded-2xl border-border bg-card">
            <DialogHeader className="border-b border-border/60 pb-3 space-y-2">
              {/* Pagination & Counter Bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">
                  Entry {readingEntryIndex! + 1} of {filteredAndSortedEntries.length}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevReader}
                    disabled={readingEntryIndex === 0}
                    className="h-7 px-2 text-xs gap-1"
                    title="Previous Entry (Left Arrow)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextReader}
                    disabled={readingEntryIndex === filteredAndSortedEntries.length - 1}
                    className="h-7 px-2 text-xs gap-1"
                    title="Next Entry (Right Arrow)"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Title & Date */}
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center justify-between gap-2 text-foreground">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <span>{format(parseISO(readingEntry.date), "EEEE, MMMM d, yyyy")}</span>
                  {readingEntry.is_starred && (
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyContent(readingEntry.raw_content)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Copy Entry Text"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStar(readingEntry)}
                    className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                    title="Toggle Star"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        readingEntry.is_starred ? "fill-amber-400 text-amber-400" : ""
                      }`}
                    />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Exact Unaltered User Words */}
            <div className="text-sm sm:text-base leading-loose whitespace-pre-wrap text-foreground/95 py-2 font-serif break-words">
              {readingEntry.raw_content}
            </div>

            {/* Wins & Good News in Reader */}
            {readingEntry.wins_and_good_news && readingEntry.wins_and_good_news.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-500 space-y-1.5">
                <span className="font-semibold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Wins & Good News Recorded:
                </span>
                <ul className="list-disc list-inside space-y-1 text-foreground/85 pl-1">
                  {readingEntry.wins_and_good_news.map((win, idx) => (
                    <li key={idx}>{win}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Nightly Coach Reflection */}
            {readingEntry.ai_coach_feedback && (
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/70 text-xs sm:text-sm text-muted-foreground italic flex items-start gap-2.5">
                <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>"{readingEntry.ai_coach_feedback}"</span>
              </div>
            )}

            {/* Reader Footer Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{readingEntry.raw_content.split(/\s+/).filter(Boolean).length} words</span>
                <span>•</span>
                <span>
                  ~{Math.max(1, Math.ceil(readingEntry.raw_content.split(/\s+/).filter(Boolean).length / 180))} min read
                </span>
                {readingEntry.mood && (
                  <>
                    <span>•</span>
                    <span className="capitalize">Mood: {readingEntry.mood}</span>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectDateForEdit(readingEntry.date);
                  setReadingEntryIndex(null);
                }}
                className="text-xs h-8 gap-1.5 font-medium border-primary/40 text-primary hover:bg-primary/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open in Writer</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DiaryHistory;
