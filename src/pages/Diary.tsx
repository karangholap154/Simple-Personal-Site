import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useDiary } from "@/hooks/useDiary";
import { parseDiaryWithGroq } from "@/lib/groq";
import { ParsedDailyDiaryAI } from "@/types/diary";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, addDays, parseISO, isToday } from "date-fns";
import {
  BookOpen,
  Lock,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Save,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  RotateCcw,
  Flame,
  FileText,
  Loader2,
  X,
  Smile,
  Zap,
  Tag,
  MessageSquareQuote,
  Target,
} from "lucide-react";

export default function Diary() {
  usePageMeta({
    title: "Personal Life Journal | Karan Gholap",
    description: "Private nightly journal and authentic reflection sanctuary.",
    path: "/diary",
  });

  const {
    session,
    authLoading,
    userEmail,
    entries,
    loading,
    selectedDate,
    setSelectedDate,
    selectedDateEntry,
    draftContent,
    draftLastSaved,
    saveDraft,
    clearDraft,
    saveEntry,
    deleteEntry,
    toggleStar,
    signOut,
  } = useDiary();

  const { toast } = useToast();

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>("write");

  // Editor content state (synced with draft or saved entry)
  const [editorText, setEditorText] = useState<string>("");
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [parsedAI, setParsedAI] = useState<ParsedDailyDiaryAI | null>(null);

  // Search in past entries
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Direct login state for private access
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync editor text and AI analysis when selectedDate or entry changes
  useEffect(() => {
    if (selectedDateEntry) {
      setEditorText(selectedDateEntry.raw_content);
      setIsStarred(selectedDateEntry.is_starred || false);

      // Reconstruct existing AI metadata if previously analyzed
      const hasAIAnalysis =
        Boolean(selectedDateEntry.ai_coach_feedback) ||
        Boolean(selectedDateEntry.ai_summary) ||
        Boolean(selectedDateEntry.mood) ||
        Number(selectedDateEntry.work_hours) > 0 ||
        Number(selectedDateEntry.unplanned_hours) > 0 ||
        (Array.isArray(selectedDateEntry.wins_and_good_news) && selectedDateEntry.wins_and_good_news.length > 0);

      if (hasAIAnalysis) {
        setParsedAI({
          work_hours: Number(selectedDateEntry.work_hours) || 0,
          work_hours_confidence: "high",
          learning_hours: Number(selectedDateEntry.learning_hours) || 0,
          learning_hours_confidence: "high",
          unplanned_hours: Number(selectedDateEntry.unplanned_hours) || 0,
          unplanned_hours_confidence: "high",
          wasted_reasons: selectedDateEntry.wasted_reasons || [],
          mood: selectedDateEntry.mood || "neutral",
          mood_score: selectedDateEntry.mood_score || 7,
          mood_confidence: "high",
          energy_level: selectedDateEntry.energy_level || "medium",
          energy_confidence: "high",
          wins_and_good_news: selectedDateEntry.wins_and_good_news || [],
          struggles_and_bad_news: selectedDateEntry.struggles_and_bad_news || [],
          projects_mentioned: [],
          people_mentioned: [],
          learnings_and_reflections: selectedDateEntry.learnings_and_reflections || "",
          tomorrow_priority: selectedDateEntry.tomorrow_priority || null,
          suggested_tags: selectedDateEntry.tags || [],
          potential_memories: [],
          summary: selectedDateEntry.ai_summary || "",
          ai_coach_feedback: selectedDateEntry.ai_coach_feedback || "",
        });
      } else {
        setParsedAI(null);
      }
    } else {
      // Use local draft if present, otherwise blank
      setEditorText(draftContent);
      setIsStarred(false);
      setParsedAI(null);
    }
  }, [selectedDate, selectedDateEntry, draftContent]);

  // Handle typing with autosave to local draft
  const handleTextChange = (text: string) => {
    setEditorText(text);
    // If not matching saved entry, save as local draft
    if (!selectedDateEntry || text !== selectedDateEntry.raw_content) {
      saveDraft(text, selectedDate);
    }
  };

  // Date navigation helpers
  const handlePrevDay = () => {
    const current = parseISO(selectedDate);
    setSelectedDate(format(subDays(current, 1), "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const current = parseISO(selectedDate);
    setSelectedDate(format(addDays(current, 1), "yyyy-MM-dd"));
  };

  const handleJumpToToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Run Groq AI analysis on the raw text and automatically save to database
  const handleAnalyzeAI = async () => {
    if (!editorText.trim()) {
      toast({
        title: "Nothing to Analyze",
        description: "Please write a few thoughts about your day first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await parseDiaryWithGroq(editorText, selectedDate);
      setParsedAI(result);

      // Auto-save the AI analysis immediately to Supabase
      const saveRes = await saveEntry({
        date: selectedDate,
        raw_content: editorText,
        is_starred: isStarred,
        work_hours: result.work_hours,
        learning_hours: result.learning_hours,
        project_hours: selectedDateEntry?.project_hours ?? 0,
        unplanned_hours: result.unplanned_hours,
        wasted_reasons: result.wasted_reasons,
        mood: result.mood,
        mood_score: result.mood_score,
        energy_level: result.energy_level,
        wins_and_good_news: result.wins_and_good_news,
        struggles_and_bad_news: result.struggles_and_bad_news,
        learnings_and_reflections: result.learnings_and_reflections,
        tomorrow_priority: result.tomorrow_priority,
        tags: result.suggested_tags,
        ai_summary: result.summary,
        ai_coach_feedback: result.ai_coach_feedback,
      });

      if (saveRes.success) {
        clearDraft(selectedDate);
      }

      toast({
        title: "AI Analysis Generated & Stored",
        description: "Derived insights and coach reflection have been saved to your entry.",
      });
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      toast({
        title: "AI Analysis Failed",
        description: err.message || "Could not complete analysis. You can still save your raw entry safely.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle explicit save to Supabase
  const handleSave = async () => {
    if (!editorText.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const result = await saveEntry({
      date: selectedDate,
      raw_content: editorText,
      is_starred: isStarred,
      work_hours: parsedAI?.work_hours ?? selectedDateEntry?.work_hours ?? 0,
      learning_hours: parsedAI?.learning_hours ?? selectedDateEntry?.learning_hours ?? 0,
      project_hours: selectedDateEntry?.project_hours ?? 0,
      unplanned_hours: parsedAI?.unplanned_hours ?? selectedDateEntry?.unplanned_hours ?? 0,
      wasted_reasons: parsedAI?.wasted_reasons ?? selectedDateEntry?.wasted_reasons ?? [],
      mood: parsedAI?.mood ?? selectedDateEntry?.mood,
      mood_score: parsedAI?.mood_score ?? selectedDateEntry?.mood_score,
      energy_level: parsedAI?.energy_level ?? selectedDateEntry?.energy_level,
      wins_and_good_news: parsedAI?.wins_and_good_news ?? selectedDateEntry?.wins_and_good_news ?? [],
      struggles_and_bad_news: parsedAI?.struggles_and_bad_news ?? selectedDateEntry?.struggles_and_bad_news ?? [],
      learnings_and_reflections: parsedAI?.learnings_and_reflections ?? selectedDateEntry?.learnings_and_reflections,
      tomorrow_priority: parsedAI?.tomorrow_priority ?? selectedDateEntry?.tomorrow_priority,
      tags: parsedAI?.suggested_tags ?? selectedDateEntry?.tags ?? [],
      ai_summary: parsedAI?.summary ?? selectedDateEntry?.ai_summary,
      ai_coach_feedback: parsedAI?.ai_coach_feedback ?? selectedDateEntry?.ai_coach_feedback,
    });
    setIsSaving(false);

    if (result.success) {
      clearDraft(selectedDate);
    }
  };

  // Handle Quick Login
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast({
        title: "Authenticated successfully!",
        description: "Welcome to your private journal.",
      });
    } catch (err: any) {
      const msg = err.message || "Failed to log in";
      setLoginError(msg);
      toast({
        title: "Authentication failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Compute streak & quick stats
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const starredCount = entries.filter((e) => e.is_starred).length;

    // Calculate current consecutive days streak
    let streak = 0;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const datesSet = new Set(entries.map((e) => e.date));

    let checkDate = new Date();
    if (!datesSet.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }

    while (datesSet.has(format(checkDate, "yyyy-MM-dd"))) {
      streak += 1;
      checkDate = subDays(checkDate, 1);
    }

    return { totalEntries, starredCount, streak };
  }, [entries]);

  // Filtered past entries for history tab
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.raw_content.toLowerCase().includes(q) ||
        entry.date.includes(q) ||
        entry.tags?.some((t) => t.toLowerCase().includes(q)) ||
        entry.wins_and_good_news?.some((w) => w.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  // Word count
  const wordCount = useMemo(() => {
    if (!editorText.trim()) return 0;
    return editorText.trim().split(/\s+/).length;
  }, [editorText]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navigation />
        </div>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  Personal Life Journal
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                A private sanctuary for your raw daily thoughts, emotions, work, and reflections.
              </p>

              {/* Status Indicator */}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
                {session?.user ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Encrypted Cloud Sync ({userEmail})
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                      <Flame className="w-3 h-3 text-amber-500" />
                      Streak: <strong className="text-foreground">{stats.streak} days</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                      <FileText className="w-3 h-3 text-primary" />
                      Total: <strong className="text-foreground">{stats.totalEntries} entries</strong>
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Private Access Only
                  </span>
                )}
              </div>
            </div>

            {/* Header Actions */}
            {session?.user && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="text-xs h-8 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {authLoading || loading ? (
            <div className="space-y-6 py-6">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-72 w-full rounded-xl" />
              <div className="flex justify-end gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          ) : session?.user ? (
            /* Authenticated Journal Workspace */
            <div className="space-y-6">
              {/* Navigation Tabs: Write Today vs Past Entries */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:w-72">
                  <TabsTrigger value="write" className="flex items-center gap-2 text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    Write Entry
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Past Entries ({entries.length})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: WRITE ENTRY */}
                <TabsContent value="write" className="space-y-5">
                  {/* Date Navigation Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card/40 backdrop-blur-xs">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevDay}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Previous Day"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                          className="h-8 w-36 text-xs bg-background/80 border-border/80 font-mono"
                        />
                        {isToday(parseISO(selectedDate)) ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
                            Today
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleJumpToToday}
                            className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                          >
                            Jump to Today
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextDay}
                        disabled={isToday(parseISO(selectedDate))}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Next Day"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Status Pill: Cloud Synced vs Local Draft */}
                    <div className="flex items-center gap-2 text-xs">
                      {selectedDateEntry ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Saved in Cloud
                        </span>
                      ) : draftLastSaved ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Draft auto-saved locally ({format(draftLastSaved, "h:mm a")})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">New blank entry</span>
                      )}
                    </div>
                  </div>

                  {/* Sacred Writing Area */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        value={editorText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder={`What happened today? Write freely in English, Marathi (मराठी), Hindi, Hinglish...

• What did you work on? What did you build or learn?
• Any good news, victories, or small moments of gratitude?
• Any struggles, bad news, frustrations, or time wasted?
• Thoughts, emotions, conversations with family or friends?

Don't worry about spelling, typos, or grammar. Your authentic words are safe here.`}
                        className="min-h-[380px] p-5 text-sm sm:text-base leading-relaxed bg-card/30 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-xl resize-y font-normal placeholder:text-muted-foreground/50 transition-all shadow-inner"
                      />
                    </div>

                    {/* Bottom Metadata & Word Count */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                      <div className="flex items-center gap-3">
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span>{editorText.length} characters</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground/80 italic">
                        Raw text is preserved permanently untouched.
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={isStarred ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsStarred(!isStarred)}
                        className={`text-xs h-9 gap-1.5 transition-colors ${
                          isStarred
                            ? "bg-amber-500 hover:bg-amber-600 text-black font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-black" : ""}`} />
                        {isStarred ? "Starred Day" : "Star This Day"}
                      </Button>

                      {draftContent && !selectedDateEntry && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            clearDraft(selectedDate);
                            setEditorText("");
                          }}
                          className="text-xs h-9 text-muted-foreground hover:text-destructive transition-colors gap-1.5"
                        >
                          Clear Draft
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Optional AI Analyze Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAnalyzeAI}
                        disabled={isAnalyzing || !editorText.trim()}
                        className="text-xs h-9 gap-2 border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span>Analyze with AI</span>
                          </>
                        )}
                      </Button>

                      {selectedDateEntry && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEntry(selectedDateEntry.id, selectedDate)}
                          className="text-xs h-9 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </Button>
                      )}

                      <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-xs h-9 px-5 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Entry</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* AI EXTRACTED INSIGHTS REVIEW CARD (ADDITIVE COMPANION) */}
                  {parsedAI && (
                    <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            AI Derived Observations
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                            Additive Layer
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setParsedAI(null)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Dismiss Analysis"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Time Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
                          <span className="text-muted-foreground block text-[11px]">💼 Deep Work</span>
                          <span className="text-base font-bold text-foreground">
                            {parsedAI.work_hours} hrs
                          </span>
                          <span className="text-[10px] text-muted-foreground block capitalize">
                            {parsedAI.work_hours_confidence} confidence
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
                          <span className="text-muted-foreground block text-[11px]">📚 Learning</span>
                          <span className="text-base font-bold text-foreground">
                            {parsedAI.learning_hours} hrs
                          </span>
                          <span className="text-[10px] text-muted-foreground block capitalize">
                            {parsedAI.learning_hours_confidence} confidence
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
                          <span className="text-muted-foreground block text-[11px]">⏳ Unplanned / Wasted</span>
                          <span className="text-base font-bold text-amber-400">
                            {parsedAI.unplanned_hours} hrs
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {parsedAI.wasted_reasons.length > 0
                              ? parsedAI.wasted_reasons.join(", ")
                              : "None recorded"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
                          <span className="text-muted-foreground block text-[11px]">🌟 Mood & Energy</span>
                          <span className="text-base font-bold text-foreground capitalize flex items-center gap-1.5">
                            {parsedAI.mood}
                            <span className="text-xs font-normal text-muted-foreground font-mono">
                              ({parsedAI.mood_score}/10)
                            </span>
                          </span>
                          <span className="text-[10px] text-muted-foreground block capitalize">
                            Energy: {parsedAI.energy_level}
                          </span>
                        </div>
                      </div>

                      {/* Wins & Struggles Chips */}
                      {(parsedAI.wins_and_good_news.length > 0 || parsedAI.struggles_and_bad_news.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                          {parsedAI.wins_and_good_news.length > 0 && (
                            <div className="p-3 rounded-xl bg-card/40 border border-emerald-500/20 space-y-1.5">
                              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                                🏆 Wins & Good News
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                                {parsedAI.wins_and_good_news.map((win, i) => (
                                  <li key={i}>{win}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {parsedAI.struggles_and_bad_news.length > 0 && (
                            <div className="p-3 rounded-xl bg-card/40 border border-amber-500/20 space-y-1.5">
                              <span className="font-semibold text-amber-400 flex items-center gap-1 text-[11px]">
                                🌧️ Struggles & Roadblocks
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                                {parsedAI.struggles_and_bad_news.map((struggle, i) => (
                                  <li key={i}>{struggle}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tomorrow's Focus Priority */}
                      {parsedAI.tomorrow_priority && (
                        <div className="p-3 rounded-xl bg-card/50 border border-border/60 text-xs flex items-center gap-2 text-foreground">
                          <Target className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <span className="text-muted-foreground text-[11px] block font-medium">
                              Tomorrow's Priority:
                            </span>
                            <span className="font-medium">{parsedAI.tomorrow_priority}</span>
                          </div>
                        </div>
                      )}

                      {/* Stoic Reflection Coach */}
                      {parsedAI.ai_coach_feedback && (
                        <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/70 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                            <MessageSquareQuote className="w-3.5 h-3.5" />
                            <span>Nightly Reflection Coach</span>
                          </div>
                          <p className="text-foreground/90 italic leading-relaxed text-[11px]">
                            "{parsedAI.ai_coach_feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: PAST ENTRIES & MEMORIES */}
                <TabsContent value="history" className="space-y-5">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search past memories, Marathi/Hindi words, coding projects, or dates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 text-xs bg-card/30 border-border/80 rounded-xl"
                    />
                  </div>

                  {/* Entries Stream */}
                  {filteredEntries.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-border rounded-xl space-y-3">
                      <BookOpen className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "No entries match your search." : "No journal entries recorded yet."}
                      </p>
                      {!searchQuery && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("write")}
                          className="text-xs"
                        >
                          Write your first entry today
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEntries.map((entry) => (
                        <article
                          key={entry.id}
                          className="p-5 rounded-xl border border-border/70 bg-card/40 hover:border-border transition-all space-y-3.5"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold text-foreground">
                                {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
                              </span>
                              {entry.is_starred && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  Starred
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(entry.date);
                                  setActiveTab("write");
                                }}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Edit in Writer
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleStar(entry)}
                                className="h-7 w-7 text-muted-foreground hover:text-amber-400"
                                title="Toggle Star"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    entry.is_starred ? "fill-amber-400 text-amber-400" : ""
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>

                          {/* HERO ELEMENT: Exact Unaltered Raw Writing */}
                          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
                            {entry.raw_content}
                          </div>

                          {/* Companion Stoic Coach Advice if present */}
                          {entry.ai_coach_feedback && (
                            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-[11px] text-muted-foreground italic flex items-start gap-2">
                              <MessageSquareQuote className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span>"{entry.ai_coach_feedback}"</span>
                            </div>
                          )}

                          {/* AI Metrics Badges */}
                          {(entry.work_hours > 0 || entry.unplanned_hours > 0 || entry.mood) && (
                            <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex-wrap">
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
                                  ⏳ Unplanned: {entry.unplanned_hours}h
                                </span>
                              )}
                              {entry.mood && (
                                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border capitalize">
                                  Mood: {entry.mood}
                                </span>
                              )}
                              {entry.energy_level && (
                                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border capitalize">
                                  Energy: {entry.energy_level}
                                </span>
                              )}
                              {entry.tags && entry.tags.length > 0 && (
                                <span className="text-[10px] text-muted-foreground/70">
                                  {entry.tags.map((t) => `#${t}`).join(" ")}
                                </span>
                              )}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            /* Unauthenticated Private Access Screen */
            <div className="max-w-md mx-auto py-12 space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-md shadow-xl text-center space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-foreground">Private Sanctuary Access</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This personal journal is strictly private. Enter your administrator credentials to access your daily reflections.
                  </p>
                </div>

                <form onSubmit={handleQuickLogin} className="space-y-3.5 text-left pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Admin Email</label>
                    <Input
                      type="email"
                      required
                      placeholder="karangholap@zohomail.in"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="text-xs h-9 bg-background/80"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Password</label>
                    <Input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="text-xs h-9 bg-background/80"
                    />
                  </div>

                  {loginError && (
                    <p className="text-[11px] text-destructive font-medium bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                      {loginError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full text-xs h-9 font-medium gap-2 mt-2"
                  >
                    {loginSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Log In & Enter Sanctuary</span>
                      </>
                    )}
                  </Button>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
                    <Link
                      to="/admin?redirect=/diary"
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Admin Panel</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      to="/"
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Return Home</span>
                    </Link>
                  </div>
                </form>
              </div>

              {/* Security Guarantee Note */}
              <div className="p-4 rounded-xl border border-border/50 bg-secondary/30 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Privacy Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your daily logs are isolated by PostgreSQL Row Level Security (RLS). Entries are never indexed by search engines, excluded from the public sitemap, and accessible only to your authenticated account.
                </p>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
