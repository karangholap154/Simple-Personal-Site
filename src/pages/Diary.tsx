import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useDiary } from "@/hooks/useDiary";
import { parseDiaryWithGroq } from "@/lib/groq";
import { ParsedDailyDiaryAI, Mood, EnergyLevel } from "@/types/diary";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, parseISO } from "date-fns";
import { BookOpen, Clock } from "lucide-react";

import DiaryHeader from "@/components/diary/DiaryHeader";
import DiaryDateNav from "@/components/diary/DiaryDateNav";
import DiaryEditor from "@/components/diary/DiaryEditor";
import DiaryAiInsights from "@/components/diary/DiaryAiInsights";
import DiaryOnThisDay from "@/components/diary/DiaryOnThisDay";
import DiaryHistory from "@/components/diary/DiaryHistory";
import DiaryPublicPulse from "@/components/diary/DiaryPublicPulse";
import DiaryAuthModal from "@/components/diary/DiaryAuthModal";
import DiaryZenModal from "@/components/diary/DiaryZenModal";

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

  // Active view tab: "write" vs "history"
  const [activeTab, setActiveTab] = useState<string>("write");

  // Editor content state
  const [editorText, setEditorText] = useState<string>("");
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(undefined);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | undefined>(undefined);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [parsedAI, setParsedAI] = useState<ParsedDailyDiaryAI | null>(null);

  // Zen Mode state
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Owner Auth Modal state (for public visitors)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const lastLoadedDateRef = useRef<string | null>(null);
  const lastLoadedEntryIdRef = useRef<string | null>(null);

  // Sync editor text and AI analysis when selectedDate or entry changes
  useEffect(() => {
    const isDateChange = lastLoadedDateRef.current !== selectedDate;
    const isInitialEntryLoad =
      !isDateChange &&
      selectedDateEntry &&
      lastLoadedEntryIdRef.current !== selectedDateEntry.id;

    if (isDateChange || isInitialEntryLoad) {
      lastLoadedDateRef.current = selectedDate;
      lastLoadedEntryIdRef.current = selectedDateEntry?.id ?? null;

      if (selectedDateEntry) {
        // If there is an uncommitted local draft for this date that differs from cloud, prefer the draft
        const savedDraft = localStorage.getItem(`karan_diary_draft_${selectedDate}`);
        if (savedDraft && savedDraft.trim() && savedDraft !== selectedDateEntry.raw_content) {
          setEditorText(savedDraft);
        } else {
          setEditorText(selectedDateEntry.raw_content);
        }
        setIsStarred(selectedDateEntry.is_starred || false);
        setSelectedMood(selectedDateEntry.mood);
        setSelectedEnergy(selectedDateEntry.energy_level);

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
        const savedDraft = localStorage.getItem(`karan_diary_draft_${selectedDate}`) || "";
        setEditorText(savedDraft);
        setIsStarred(false);
        setSelectedMood(undefined);
        setSelectedEnergy(undefined);
        setParsedAI(null);
      }
    }
  }, [selectedDate, selectedDateEntry]);

  // Handle typing with autosave to local draft
  const handleTextChange = useCallback(
    (text: string) => {
      setEditorText(text);
      if (!selectedDateEntry || text !== selectedDateEntry.raw_content) {
        saveDraft(text, selectedDate);
      } else {
        clearDraft(selectedDate);
      }
    },
    [selectedDateEntry, selectedDate, saveDraft, clearDraft]
  );

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
      setSelectedMood(result.mood);
      setSelectedEnergy(result.energy_level);

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

      if (saveRes.success && saveRes.data) {
        clearDraft(selectedDate);
        lastLoadedEntryIdRef.current = (saveRes.data as DailyLogEntry).id;
      }

      toast({
        title: "AI Analysis Derived & Stored",
        description: "Observations and Nightly Coach reflection have been saved to your entry.",
      });
    } catch (err: unknown) {
      console.error("AI Analysis error:", err);
      const errMsg = err instanceof Error ? err.message : "Could not complete analysis. You can still save your raw entry safely.";
      toast({
        title: "AI Analysis Failed",
        description: errMsg,
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
      mood: selectedMood ?? parsedAI?.mood ?? selectedDateEntry?.mood,
      mood_score: parsedAI?.mood_score ?? selectedDateEntry?.mood_score,
      energy_level: selectedEnergy ?? parsedAI?.energy_level ?? selectedDateEntry?.energy_level,
      wins_and_good_news: parsedAI?.wins_and_good_news ?? selectedDateEntry?.wins_and_good_news ?? [],
      struggles_and_bad_news: parsedAI?.struggles_and_bad_news ?? selectedDateEntry?.struggles_and_bad_news ?? [],
      learnings_and_reflections: parsedAI?.learnings_and_reflections ?? selectedDateEntry?.learnings_and_reflections,
      tomorrow_priority: parsedAI?.tomorrow_priority ?? selectedDateEntry?.tomorrow_priority,
      tags: parsedAI?.suggested_tags ?? selectedDateEntry?.tags ?? [],
      ai_summary: parsedAI?.summary ?? selectedDateEntry?.ai_summary,
      ai_coach_feedback: parsedAI?.ai_coach_feedback ?? selectedDateEntry?.ai_coach_feedback,
    });
    setIsSaving(false);

    if (result.success && result.data) {
      clearDraft(selectedDate);
      lastLoadedEntryIdRef.current = (result.data as DailyLogEntry).id;
    }
  };

  // Check if current editor has unsaved changes compared to cloud entry
  const hasUnsavedChanges = useMemo(() => {
    if (selectedDateEntry) {
      return (
        editorText !== selectedDateEntry.raw_content ||
        isStarred !== (selectedDateEntry.is_starred || false) ||
        (selectedMood !== undefined && selectedMood !== selectedDateEntry.mood) ||
        (selectedEnergy !== undefined && selectedEnergy !== selectedDateEntry.energy_level)
      );
    }
    return editorText.trim().length > 0;
  }, [selectedDateEntry, editorText, isStarred, selectedMood, selectedEnergy]);

  // Compute streak & quick stats
  const stats = useMemo(() => {
    const totalEntries = entries.length;
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

    return { totalEntries, streak };
  }, [entries]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navigation />
        </div>

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-7">
          {/* Header Section */}
          <DiaryHeader
            isAuthenticated={Boolean(session?.user)}
            userEmail={userEmail}
            streak={stats.streak}
            totalEntries={stats.totalEntries}
            onSignOut={signOut}
            onToggleZen={() => setIsZenMode(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Loading Skeleton */}
          {authLoading || loading ? (
            <div className="space-y-6 py-8">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-80 w-full rounded-2xl" />
              <div className="flex justify-end gap-3">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>
          ) : session?.user ? (
            /* Authenticated Journal Sanctuary Workspace */
            <div className="space-y-6">
              {/* Navigation Tabs: Write Entry vs Past Entries */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:w-80 h-10 p-1 bg-secondary/60 rounded-xl">
                  <TabsTrigger value="write" className="flex items-center gap-2 text-xs font-medium rounded-lg">
                    <BookOpen className="w-3.5 h-3.5" />
                    Write Entry
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2 text-xs font-medium rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    Past Archive ({entries.length})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: WRITE ENTRY */}
                <TabsContent value="write" className="space-y-6 focus-visible:outline-hidden">
                  {/* On This Day Flashback (if historical entry exists) */}
                  <DiaryOnThisDay
                    entries={entries}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />

                  {/* Date Navigation & Calendar Picker */}
                  <DiaryDateNav
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    entries={entries}
                    selectedDateEntry={selectedDateEntry}
                    draftLastSaved={draftLastSaved}
                    hasUnsavedChanges={hasUnsavedChanges}
                  />

                  {/* Sacred Writing Area & Action Toolbar */}
                  <DiaryEditor
                    selectedDate={selectedDate}
                    editorText={editorText}
                    onChangeText={handleTextChange}
                    isStarred={isStarred}
                    onToggleStar={() => setIsStarred(!isStarred)}
                    isSaving={isSaving}
                    onSave={handleSave}
                    isAnalyzing={isAnalyzing}
                    onAnalyzeAI={handleAnalyzeAI}
                    selectedDateEntry={selectedDateEntry}
                    onDeleteEntry={() => {
                      if (selectedDateEntry) {
                        deleteEntry(selectedDateEntry.id, selectedDate);
                        clearDraft(selectedDate);
                        setEditorText("");
                        setParsedAI(null);
                        setIsStarred(false);
                        setSelectedMood(undefined);
                        setSelectedEnergy(undefined);
                        lastLoadedEntryIdRef.current = null;
                      }
                    }}
                    onClearDraft={() => {
                      clearDraft(selectedDate);
                      if (selectedDateEntry) {
                        setEditorText(selectedDateEntry.raw_content);
                        setIsStarred(selectedDateEntry.is_starred || false);
                        setSelectedMood(selectedDateEntry.mood);
                        setSelectedEnergy(selectedDateEntry.energy_level);
                      } else {
                        setEditorText("");
                      }
                    }}
                    hasDraft={Boolean(draftContent)}
                    hasUnsavedChanges={hasUnsavedChanges}
                    selectedMood={selectedMood}
                    onSelectMood={setSelectedMood}
                    selectedEnergy={selectedEnergy}
                    onSelectEnergy={setSelectedEnergy}
                  />

                  {/* AI Extracted Insights Card (Additive Companion) */}
                  {parsedAI && (
                    <DiaryAiInsights
                      insights={parsedAI}
                      onDismiss={() => setParsedAI(null)}
                    />
                  )}
                </TabsContent>

                {/* TAB 2: PAST ENTRIES & MEMORIES */}
                <TabsContent value="history" className="space-y-6 focus-visible:outline-hidden">
                  <DiaryHistory
                    entries={entries}
                    onSelectDateForEdit={(date) => {
                      setSelectedDate(date);
                      setActiveTab("write");
                    }}
                    onToggleStar={toggleStar}
                    onDeleteEntry={deleteEntry}
                    onSwitchToWrite={() => setActiveTab("write")}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            /* Dynamic Public Pulse with Live Habit Heatmap & Metrics */
            <DiaryPublicPulse onOpenAuth={() => setIsAuthModalOpen(true)} />
          )}
        </main>

        {/* Owner Authentication Modal Dialog */}
        <DiaryAuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
        />

        {/* Zen Focus Mode Modal */}
        <DiaryZenModal
          isOpen={isZenMode}
          onClose={() => setIsZenMode(false)}
          selectedDate={selectedDate}
          editorText={editorText}
          onChangeText={handleTextChange}
          isStarred={isStarred}
          onToggleStar={() => setIsStarred(!isStarred)}
          isSaving={isSaving}
          onSave={handleSave}
          isCloudSaved={Boolean(selectedDateEntry)}
          draftLastSaved={draftLastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto">
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
}
