import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DailyLogEntry } from "@/types/diary";

interface DiaryHistoryProps {
  entries: DailyLogEntry[];
  onSelectDateForEdit: (date: string) => void;
  onToggleStar: (entry: DailyLogEntry) => void;
  onDeleteEntry: (id: string, date: string) => void;
  onSwitchToWrite: () => void;
}

type FilterType = "all" | "starred" | "work" | "wins";

export const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  entries,
  onSelectDateForEdit,
  onToggleStar,
  onDeleteEntry,
  onSwitchToWrite,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [readingEntry, setReadingEntry] = useState<DailyLogEntry | null>(null);

  // Filter & Search logic
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Apply Filter Type
    if (activeFilter === "starred") {
      result = result.filter((e) => e.is_starred);
    } else if (activeFilter === "work") {
      result = result.filter((e) => (Number(e.work_hours) || 0) > 0);
    } else if (activeFilter === "wins") {
      result = result.filter((e) => e.wins_and_good_news && e.wins_and_good_news.length > 0);
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.raw_content.toLowerCase().includes(q) ||
          entry.date.includes(q) ||
          entry.tags?.some((t) => t.toLowerCase().includes(q)) ||
          entry.wins_and_good_news?.some((w) => w.toLowerCase().includes(q)) ||
          entry.ai_coach_feedback?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [entries, activeFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search past entries, Marathi/Hindi words, tags, or dates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-9 h-10 text-xs bg-card/40 border-border/80 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className="text-xs h-8 px-2.5 rounded-lg border-border/80"
          >
            All ({entries.length})
          </Button>
          <Button
            variant={activeFilter === "starred" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("starred")}
            className="text-xs h-8 px-2.5 rounded-lg gap-1 border-border/80"
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            Starred ({entries.filter((e) => e.is_starred).length})
          </Button>
          <Button
            variant={activeFilter === "work" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("work")}
            className="text-xs h-8 px-2.5 rounded-lg border-border/80"
          >
            Deep Work
          </Button>
          <Button
            variant={activeFilter === "wins" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("wins")}
            className="text-xs h-8 px-2.5 rounded-lg border-border/80"
          >
            Wins
          </Button>
        </div>
      </div>

      {/* Entries Stream */}
      {filteredEntries.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/80 rounded-2xl space-y-3 bg-card/20">
          <div className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground mx-auto">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {searchQuery ? "No entries match your search" : "No entries recorded yet"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for a different keyword, tag, or reset the filters."
                : "Your raw nightly thoughts and reflections will be archived here safely."}
            </p>
          </div>
          {!searchQuery && (
            <Button
              size="sm"
              onClick={onSwitchToWrite}
              className="text-xs h-8 px-4"
            >
              Write your first entry today
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const dateObj = parseISO(entry.date);
            const wordCount = entry.raw_content ? entry.raw_content.trim().split(/\s+/).length : 0;

            return (
              <article
                key={entry.id}
                className="p-5 sm:p-6 rounded-2xl border border-border/70 bg-card/40 hover:border-border transition-all space-y-3.5 shadow-xs"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                      {format(dateObj, "EEEE, MMMM d, yyyy")}
                    </span>
                    {entry.is_starred && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        <Star className="w-3 h-3 fill-amber-400" />
                        Starred
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      • {wordCount} words
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReadingEntry(entry)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                      title="Read in Book Mode"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Read</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectDateForEdit(entry.date)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                      title="Edit in Writer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStar(entry)}
                      className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                      title="Toggle Star"
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

                {/* HERO ELEMENT: Exact Unaltered Raw Writing */}
                <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans break-words overflow-hidden">
                  {entry.raw_content}
                </div>

                {/* Nightly Reflection Stoic Feedback */}
                {entry.ai_coach_feedback && (
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground italic flex items-start gap-2.5">
                    <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>"{entry.ai_coach_feedback}"</span>
                  </div>
                )}

                {/* AI Structured Badges Footer */}
                {(entry.work_hours > 0 ||
                  entry.learning_hours > 0 ||
                  entry.unplanned_hours > 0 ||
                  entry.mood ||
                  (entry.tags && entry.tags.length > 0)) && (
                  <div className="flex items-center gap-2 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground flex-wrap">
                    {entry.work_hours > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">
                        💼 Work: {entry.work_hours}h
                      </span>
                    )}
                    {entry.learning_hours > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">
                        📚 Learning: {entry.learning_hours}h
                      </span>
                    )}
                    {entry.unplanned_hours > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-amber-400">
                        ⏳ Lost: {entry.unplanned_hours}h
                      </span>
                    )}
                    {entry.mood && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary border border-border capitalize">
                        Mood: {entry.mood}
                      </span>
                    )}
                    {entry.energy_level && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary border border-border capitalize">
                        Energy: {entry.energy_level.replace("_", " ")}
                      </span>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="text-[10px] text-muted-foreground/75 font-mono ml-auto">
                        {entry.tags.map((t) => `#${t}`).join(" ")}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Reader Mode Dialog */}
      {readingEntry && (
        <Dialog open={Boolean(readingEntry)} onOpenChange={(open) => !open && setReadingEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>{format(parseISO(readingEntry.date), "EEEE, MMMM d, yyyy")}</span>
                {readingEntry.is_starred && (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="text-sm sm:text-base leading-loose whitespace-pre-wrap text-foreground/95 py-2 font-serif">
              {readingEntry.raw_content}
            </div>

            {readingEntry.ai_coach_feedback && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground italic flex items-start gap-2">
                <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>"{readingEntry.ai_coach_feedback}"</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <span>{readingEntry.raw_content.split(/\s+/).length} words</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectDateForEdit(readingEntry.date);
                  setReadingEntry(null);
                }}
                className="text-xs h-8 gap-1.5"
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
