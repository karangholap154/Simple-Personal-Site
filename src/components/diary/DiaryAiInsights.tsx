import React from "react";
import {
  Sparkles,
  X,
  Target,
  MessageSquareQuote,
  CheckCircle2,
  TrendingUp,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParsedDailyDiaryAI, ConfidenceLevel } from "@/types/diary";

interface DiaryAiInsightsProps {
  insights: ParsedDailyDiaryAI;
  onDismiss: () => void;
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const colorMap = {
    high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    low: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span
      className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${
        colorMap[level] || colorMap.medium
      }`}
    >
      {level} conf
    </span>
  );
}

export const DiaryAiInsights: React.FC<DiaryAiInsightsProps> = ({ insights, onDismiss }) => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-primary/25 bg-primary/5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary/15 pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            AI Derived Observations
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
            Additive Companion
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
          title="Dismiss Insights"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary note if present */}
      {insights.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-3">
          "{insights.summary}"
        </p>
      )}

      {/* Time & State Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Deep Work */}
        <div className="p-3.5 rounded-xl bg-card/70 border border-border/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>💼 Deep Work</span>
            <ConfidenceBadge level={insights.work_hours_confidence} />
          </div>
          <div className="text-xl font-bold text-foreground">
            {insights.work_hours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
          </div>
          <span className="text-[10px] text-muted-foreground block truncate">
            {insights.work_hours > 0 ? "Productive output" : "No coding noted"}
          </span>
        </div>

        {/* Learning */}
        <div className="p-3.5 rounded-xl bg-card/70 border border-border/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>📚 Learning</span>
            <ConfidenceBadge level={insights.learning_hours_confidence} />
          </div>
          <div className="text-xl font-bold text-foreground">
            {insights.learning_hours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
          </div>
          <span className="text-[10px] text-muted-foreground block truncate">
            {insights.learning_hours > 0 ? "Study & upskilling" : "None noted"}
          </span>
        </div>

        {/* Distraction / Unplanned */}
        <div className="p-3.5 rounded-xl bg-card/70 border border-border/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>⏳ Regretted / Lost</span>
            <ConfidenceBadge level={insights.unplanned_hours_confidence} />
          </div>
          <div className="text-xl font-bold text-amber-500">
            {insights.unplanned_hours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
          </div>
          <span className="text-[10px] text-muted-foreground block truncate">
            {insights.wasted_reasons && insights.wasted_reasons.length > 0
              ? insights.wasted_reasons.join(", ")
              : "0 wasted hours stated"}
          </span>
        </div>

        {/* Mood & Energy */}
        <div className="p-3.5 rounded-xl bg-card/70 border border-border/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>🌟 Vibe & Energy</span>
            <ConfidenceBadge level={insights.mood_confidence} />
          </div>
          <div className="text-sm font-bold text-foreground capitalize flex items-center gap-1.5">
            <span>{insights.mood}</span>
            <span className="text-xs font-mono text-muted-foreground font-normal">
              ({insights.mood_score}/10)
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block capitalize">
            Energy: <strong className="text-foreground">{insights.energy_level?.replace("_", " ")}</strong>
          </span>
        </div>
      </div>

      {/* Wins & Struggles Chips */}
      {(insights.wins_and_good_news.length > 0 || insights.struggles_and_bad_news.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          {insights.wins_and_good_news.length > 0 && (
            <div className="p-3.5 rounded-xl bg-card/50 border border-emerald-500/25 space-y-2">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                Wins & Good News
              </span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                {insights.wins_and_good_news.map((win, i) => (
                  <li key={i} className="text-foreground/90">{win}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.struggles_and_bad_news.length > 0 && (
            <div className="p-3.5 rounded-xl bg-card/50 border border-amber-500/25 space-y-2">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                Struggles & Roadblocks
              </span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                {insights.struggles_and_bad_news.map((struggle, i) => (
                  <li key={i} className="text-foreground/90">{struggle}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tomorrow's Priority Banner */}
      {insights.tomorrow_priority && (
        <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 text-xs flex items-center gap-3 text-foreground">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">
              Tomorrow's Priority Focus
            </span>
            <span className="font-medium text-foreground text-xs sm:text-sm">{insights.tomorrow_priority}</span>
          </div>
        </div>
      )}

      {/* Nightly Reflection Stoic Coach */}
      {insights.ai_coach_feedback && (
        <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Nightly Reflection Coach</span>
          </div>
          <p className="text-foreground/90 italic leading-relaxed text-xs">
            "{insights.ai_coach_feedback}"
          </p>
        </div>
      )}

      {/* Tags */}
      {insights.suggested_tags && insights.suggested_tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-muted-foreground">
          <Tag className="w-3 h-3 text-primary" />
          <span>Tags:</span>
          {insights.suggested_tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-mono text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiaryAiInsights;
