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
      const normalized = ((data || []) as any[]).map((item) => ({
        ...item,
        work_hours: Number(item.work_hours) || 0,
        learning_hours: Number(item.learning_hours) || 0,
        project_hours: Number(item.project_hours) || 0,
        unplanned_hours: Number(item.unplanned_hours) || 0,
        mood_score: item.mood_score ? Number(item.mood_score) : undefined,
        wins_and_good_news: Array.isArray(item.wins_and_good_news) ? item.wins_and_good_news : [],
        struggles_and_bad_news: Array.isArray(item.struggles_and_bad_news) ? item.struggles_and_bad_news : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        wasted_reasons: Array.isArray(item.wasted_reasons) ? item.wasted_reasons : [],
      }));
      setEntries(normalized as DailyLogEntry[]);
    } catch (err: any) {
      console.error("Error fetching daily logs:", err);
      toast({
        title: "Failed to load journal entries",
        description: err.message || "Could not fetch your diary entries.",
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
        const normalizedItem: DailyLogEntry = {
          ...(data as any),
          work_hours: Number(data.work_hours) || 0,
          learning_hours: Number(data.learning_hours) || 0,
          project_hours: Number(data.project_hours) || 0,
          unplanned_hours: Number(data.unplanned_hours) || 0,
          mood_score: data.mood_score ? Number(data.mood_score) : undefined,
          wins_and_good_news: Array.isArray(data.wins_and_good_news) ? data.wins_and_good_news : [],
          struggles_and_bad_news: Array.isArray(data.struggles_and_bad_news) ? data.struggles_and_bad_news : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          wasted_reasons: Array.isArray(data.wasted_reasons) ? data.wasted_reasons : [],
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
      } catch (err: any) {
        console.error("Error saving daily log:", err);
        toast({
          title: "Save Failed",
          description: err.message || "Failed to save journal entry. Your draft is still saved locally.",
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
      } catch (err: any) {
        console.error("Error deleting entry:", err);
        toast({
          title: "Delete Failed",
          description: err.message || "Failed to delete entry.",
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
      } catch (err: any) {
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
