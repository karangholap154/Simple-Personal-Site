/**
 * Daily Diary & Nightly Reflection System Types
 * Based on DAILY_DIARY_SYSTEM_SPEC.md (v2.0.0)
 *
 * Core Principle: Your Words First. AI Second.
 */

export type Mood =
  | "ecstatic"
  | "happy"
  | "calm"
  | "neutral"
  | "tired"
  | "anxious"
  | "frustrated"
  | "down";

export type EnergyLevel = "high" | "medium" | "low" | "burned_out";

export type TimeCategory =
  | "work"
  | "learning"
  | "project"
  | "family"
  | "social"
  | "health"
  | "travel"
  | "personal"
  | "entertainment"
  | "rest"
  | "unplanned"
  | "other";

export type DataProvenance = "explicit" | "estimated" | "inferred";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface HourlyBlock {
  id?: string;
  start_time: string; // e.g. "09:00"
  end_time: string;   // e.g. "11:30"
  category: TimeCategory;
  description: string;
  source?: DataProvenance;
}

export interface DailyLogEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD

  // Immutable primary source of truth
  raw_content: string;

  // Time metrics (in hours)
  work_hours: number;
  learning_hours: number;
  project_hours: number;
  unplanned_hours: number;
  wasted_reasons?: string[];

  // Emotional & Mental reflections
  mood?: Mood;
  mood_score?: number; // 1 to 10
  energy_level?: EnergyLevel;

  // Key takeaways
  wins_and_good_news?: string[];
  struggles_and_bad_news?: string[];
  learnings_and_reflections?: string;
  tomorrow_priority?: string;

  // Granular day audit (optional)
  hourly_blocks?: HourlyBlock[];

  // Organization & Memories
  tags?: string[];
  is_starred?: boolean;
  memory_candidate?: boolean;

  // Optional AI companion insights
  ai_summary?: string;
  ai_coach_feedback?: string;
  ai_analysis_version?: string;
  ai_analyzed_at?: string;

  created_at?: string;
  updated_at?: string;
}

export interface LocalDiaryDraft {
  date: string; // YYYY-MM-DD
  raw_content: string;
  last_saved_at: string; // ISO string
}

export interface DiaryDaySummary {
  date: string;
  has_entry: boolean;
  work_hours: number;
  unplanned_hours: number;
  mood?: Mood;
  mood_score?: number;
  is_starred?: boolean;
}

export interface ParsedDailyDiaryAI {
  work_hours: number;
  work_hours_confidence: ConfidenceLevel;
  learning_hours: number;
  learning_hours_confidence: ConfidenceLevel;
  unplanned_hours: number;
  unplanned_hours_confidence: ConfidenceLevel;
  wasted_reasons: string[];
  mood: Mood;
  mood_score: number;
  mood_confidence: ConfidenceLevel;
  energy_level: EnergyLevel;
  energy_confidence: ConfidenceLevel;
  wins_and_good_news: string[];
  struggles_and_bad_news: string[];
  projects_mentioned: string[];
  people_mentioned: string[];
  learnings_and_reflections: string;
  tomorrow_priority: string | null;
  suggested_tags: string[];
  potential_memories: string[];
  summary: string;
  ai_coach_feedback: string;
}
