import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { DailyLogEntry } from "@/types/diary";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DRAFT_PREFIX = "karan_diary_draft_";

export function useDiary() {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  // Draft management
  const [draftContent, setDraftContent] = useState<string>("");
  const [draftLastSaved, setDraftLastSaved] = useState<Date | null>(null);

  // Track Supabase Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load draft for selected date from localStorage
  useEffect(() => {
    const key = `${DRAFT_PREFIX}${selectedDate}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setDraftContent(saved);
      setDraftLastSaved(new Date());
    } else {
      setDraftContent("");
      setDraftLastSaved(null);
    }
  }, [selectedDate]);

  // Fetch entries from Supabase
  const fetchEntries = useCallback(async () => {
    if (!session?.user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      const rawList = (data || []) as Record<string, unknown>[];
      const normalized = rawList.map((item) => ({
        ...(item as unknown as DailyLogEntry),
        work_hours: Number(item.work_hours) || 0,
        learning_hours: Number(item.learning_hours) || 0,
        project_hours: Number(item.project_hours) || 0,
        unplanned_hours: Number(item.unplanned_hours) || 0,
        mood_score: item.mood_score ? Number(item.mood_score) : undefined,
        wins_and_good_news: Array.isArray(item.wins_and_good_news) ? (item.wins_and_good_news as string[]) : [],
        struggles_and_bad_news: Array.isArray(item.struggles_and_bad_news) ? (item.struggles_and_bad_news as string[]) : [],
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
        wasted_reasons: Array.isArray(item.wasted_reasons) ? (item.wasted_reasons as string[]) : [],
      }));
      setEntries(normalized);
    } catch (err: unknown) {
      console.error("Error fetching daily logs:", err);
      const errMsg = err instanceof Error ? err.message : "Could not fetch your diary entries.";
      toast({
        title: "Failed to load journal entries",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchEntries();
    }
  }, [authLoading, fetchEntries]);

  // Save draft locally
  const saveDraft = useCallback(
    (text: string, date: string = selectedDate) => {
      const key = `${DRAFT_PREFIX}${date}`;
      if (!text.trim()) {
        localStorage.removeItem(key);
        setDraftContent("");
        setDraftLastSaved(null);
      } else {
        localStorage.setItem(key, text);
        setDraftContent(text);
        setDraftLastSaved(new Date());
      }
    },
    [selectedDate]
  );

  // Clear draft
  const clearDraft = useCallback((date: string = selectedDate) => {
    localStorage.removeItem(`${DRAFT_PREFIX}${date}`);
    setDraftContent("");
    setDraftLastSaved(null);
  }, [selectedDate]);

  // Save or update an entry in Supabase
  const saveEntry = useCallback(
    async (
      entryData: {
        date: string;
        raw_content: string;
        work_hours?: number;
        learning_hours?: number;
        project_hours?: number;
        unplanned_hours?: number;
        wasted_reasons?: string[];
        mood?: string;
        mood_score?: number;
        energy_level?: string;
        wins_and_good_news?: string[];
        struggles_and_bad_news?: string[];
        learnings_and_reflections?: string;
        tomorrow_priority?: string;
        tags?: string[];
        is_starred?: boolean;
        ai_summary?: string;
        ai_coach_feedback?: string;
      }
    ) => {
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your private journal entry.",
          variant: "destructive",
        });
        return { success: false, error: "Not authenticated" };
      }

      try {
        const payload = {
          user_id: session.user.id,
          date: entryData.date,
          raw_content: entryData.raw_content,
          work_hours: entryData.work_hours ?? 0,
          learning_hours: entryData.learning_hours ?? 0,
          project_hours: entryData.project_hours ?? 0,
          unplanned_hours: entryData.unplanned_hours ?? 0,
          wasted_reasons: entryData.wasted_reasons ?? [],
          mood: entryData.mood || null,
          mood_score: entryData.mood_score || null,
          energy_level: entryData.energy_level || null,
          wins_and_good_news: entryData.wins_and_good_news ?? [],
          struggles_and_bad_news: entryData.struggles_and_bad_news ?? [],
          learnings_and_reflections: entryData.learnings_and_reflections || null,
          tomorrow_priority: entryData.tomorrow_priority || null,
          tags: entryData.tags ?? [],
          is_starred: entryData.is_starred ?? false,
          ai_summary: entryData.ai_summary || null,
          ai_coach_feedback: entryData.ai_coach_feedback || null,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("daily_logs")
          .upsert(payload, { onConflict: "user_id,date" })
          .select()
          .single();

        if (error) throw error;

        // Clear local draft upon successful save
        clearDraft(entryData.date);

        // Update local entries list
        const rawItem = data as Record<string, unknown>;
        const normalizedItem: DailyLogEntry = {
          ...(rawItem as unknown as DailyLogEntry),
          work_hours: Number(rawItem.work_hours) || 0,
          learning_hours: Number(rawItem.learning_hours) || 0,
          project_hours: Number(rawItem.project_hours) || 0,
          unplanned_hours: Number(rawItem.unplanned_hours) || 0,
          mood_score: rawItem.mood_score ? Number(rawItem.mood_score) : undefined,
          wins_and_good_news: Array.isArray(rawItem.wins_and_good_news) ? (rawItem.wins_and_good_news as string[]) : [],
          struggles_and_bad_news: Array.isArray(rawItem.struggles_and_bad_news) ? (rawItem.struggles_and_bad_news as string[]) : [],
          tags: Array.isArray(rawItem.tags) ? (rawItem.tags as string[]) : [],
          wasted_reasons: Array.isArray(rawItem.wasted_reasons) ? (rawItem.wasted_reasons as string[]) : [],
        };

        setEntries((prev) => {
          const index = prev.findIndex((e) => e.date === entryData.date);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = normalizedItem;
            return updated;
          }
          return [normalizedItem, ...prev].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });

        toast({
          title: "Entry Saved",
          description: `Your journal entry for ${entryData.date} is securely stored.`,
        });

        return { success: true, data };
      } catch (err: unknown) {
        console.error("Error saving daily log:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to save journal entry. Your draft is still saved locally.";
        toast({
          title: "Save Failed",
          description: errMsg,
          variant: "destructive",
        });
        return { success: false, error: err };
      }
    },
    [session?.user, clearDraft, toast]
  );

  // Delete an entry
  const deleteEntry = useCallback(
    async (id: string, date: string) => {
      if (!session?.user) return;

      try {
        const { error } = await supabase.from("daily_logs").delete().eq("id", id);
        if (error) throw error;

        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast({
          title: "Entry Deleted",
          description: `Journal entry for ${date} was removed.`,
        });
      } catch (err: unknown) {
        console.error("Error deleting entry:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to delete entry.";
        toast({
          title: "Delete Failed",
          description: errMsg,
          variant: "destructive",
        });
      }
    },
    [session?.user, toast]
  );

  // Toggle star
  const toggleStar = useCallback(
    async (entry: DailyLogEntry) => {
      const nextStarred = !entry.is_starred;
      try {
        const { error } = await supabase
          .from("daily_logs")
          .update({ is_starred: nextStarred })
          .eq("id", entry.id);

        if (error) throw error;

        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, is_starred: nextStarred } : e))
        );
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: "Could not update star status.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Find entry for selected date
  const selectedDateEntry = useMemo(
    () => entries.find((e) => e.date === selectedDate) || null,
    [entries, selectedDate]
  );

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setEntries([]);
  }, []);

  return {
    session,
    authLoading,
    userEmail: session?.user?.email,
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
    refreshEntries: fetchEntries,
    signOut,
  };
}
