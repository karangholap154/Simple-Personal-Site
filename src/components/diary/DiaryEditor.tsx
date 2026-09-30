import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Sparkles,
  Save,
  Star,
  Trash2,
  Loader2,
  Lightbulb,
  Smile,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { DailyLogEntry, Mood, EnergyLevel } from "@/types/diary";

interface DiaryEditorProps {
  selectedDate: string;
  editorText: string;
  onChangeText: (text: string) => void;
  isStarred: boolean;
  onToggleStar: () => void;
  isSaving: boolean;
  onSave: () => void;
  isAnalyzing: boolean;
  onAnalyzeAI: () => void;
  selectedDateEntry: DailyLogEntry | null;
  onDeleteEntry?: () => void;
  onClearDraft?: () => void;
  hasDraft: boolean;
  selectedMood?: Mood;
  onSelectMood?: (mood: Mood) => void;
  selectedEnergy?: EnergyLevel;
  onSelectEnergy?: (energy: EnergyLevel) => void;
}

const PROMPT_STARTERS = [
  { label: "🚀 Deep Work & Build", text: "\n\n• What did I build, ship, or learn today?\n- " },
  { label: "🏆 Wins & Victories", text: "\n\n• What went surprisingly well or made me proud today?\n- " },
  { label: "🌧️ Roadblocks & Frustrations", text: "\n\n• What drained my focus or blocked progress today?\n- " },
  { label: "💬 Life & Conversations", text: "\n\n• Moments with family, friends, or reflections on life:\n- " },
  { label: "🎯 Tomorrow's Priority", text: "\n\n• If I could only achieve ONE thing tomorrow, it is:\n- " },
];

const MOOD_OPTIONS: { id: Mood; label: string; icon: string }[] = [
  { id: "ecstatic", label: "Ecstatic", icon: "✨" },
  { id: "happy", label: "Happy", icon: "😊" },
  { id: "calm", label: "Calm", icon: "🍃" },
  { id: "neutral", label: "Neutral", icon: "😐" },
  { id: "tired", label: "Tired", icon: "🥱" },
  { id: "anxious", label: "Anxious", icon: "⚡" },
  { id: "frustrated", label: "Frustrated", icon: "😤" },
  { id: "down", label: "Down", icon: "🌧️" },
];

const ENERGY_OPTIONS: { id: EnergyLevel; label: string; icon: string }[] = [
  { id: "high", label: "High Energy", icon: "⚡" },
  { id: "medium", label: "Steady", icon: "🔋" },
  { id: "low", label: "Low", icon: "🪫" },
  { id: "burned_out", label: "Exhausted", icon: "💤" },
];

export const DiaryEditor: React.FC<DiaryEditorProps> = ({
  selectedDate,
  editorText,
  onChangeText,
  isStarred,
  onToggleStar,
  isSaving,
  onSave,
  isAnalyzing,
  onAnalyzeAI,
  selectedDateEntry,
  onDeleteEntry,
  onClearDraft,
  hasDraft,
  selectedMood,
  onSelectMood,
  selectedEnergy,
  onSelectEnergy,
}) => {
  const [showPrompts, setShowPrompts] = useState(false);

  // Compute word and character count + reading time
  const wordCount = React.useMemo(() => {
    if (!editorText.trim()) return 0;
    return editorText.trim().split(/\s+/).length;
  }, [editorText]);

  const readingTime = Math.ceil(wordCount / 180);

  const handleAppendPrompt = (promptText: string) => {
    onChangeText((editorText ? editorText.trimEnd() : "") + promptText);
  };

  // Support Ctrl+S or Cmd+S to quickly save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (!isSaving && editorText.trim()) {
        onSave();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Mood & Reflection Bar (Optional Check-in) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/60 bg-card/30 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mr-1">
            <Smile className="w-3.5 h-3.5 text-primary" />
            Mood:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMood && onSelectMood(m.id)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] transition-all flex items-center gap-1 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                      : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="hidden md:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Starters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompts(!showPrompts)}
          className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-center"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Need Inspiration?</span>
          {showPrompts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Expandable Prompt Starters Drawer */}
      {showPrompts && (
        <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Gentle Evening Prompts
            </span>
            <span className="text-[10px] text-muted-foreground">Click to insert into your entry</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {PROMPT_STARTERS.map((prompt, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAppendPrompt(prompt.text)}
                className="h-7 text-[11px] bg-background/80 hover:bg-amber-500/10 hover:border-amber-500/40 border-border/80 text-foreground transition-all"
              >
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sacred Raw Writing Sanctuary */}
      <div className="relative group">
        <Textarea
          value={editorText}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`What happened today? Write freely in English, Marathi (मराठी), Hindi, Hinglish...

• What did you work on? What did you build or learn?
• Any victories, good news, or small moments of gratitude?
• Any struggles, bugs, bad news, or wasted time?
• Thoughts, emotions, conversations with family or friends?

Spelling, typos, and grammar don't matter here. Your authentic words are permanently preserved.`}
          className="min-h-[380px] p-5 sm:p-6 text-sm sm:text-base leading-relaxed bg-card/40 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/60 rounded-2xl resize-y font-normal placeholder:text-muted-foreground/45 transition-all shadow-inner"
        />
      </div>

      {/* Editor Footer / Word Count & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">{wordCount} words</span>
          <span>•</span>
          <span>{editorText.length} characters</span>
          {wordCount > 0 && (
            <>
              <span>•</span>
              <span>~{readingTime} min read</span>
            </>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground/80 italic">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-mono">⌘/Ctrl+S</kbd> to save.
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Star Button */}
          <Button
            type="button"
            variant={isStarred ? "default" : "outline"}
            size="sm"
            onClick={onToggleStar}
            className={`text-xs h-9 gap-1.5 transition-all flex-1 sm:flex-none ${
              isStarred
                ? "bg-amber-500 hover:bg-amber-600 text-black font-medium border-amber-500 shadow-xs"
                : "border-border/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-black" : ""}`} />
            <span>{isStarred ? "Starred Day" : "Star This Day"}</span>
          </Button>

          {/* Clear Draft */}
          {hasDraft && !selectedDateEntry && onClearDraft && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearDraft}
              className="text-xs h-9 text-muted-foreground hover:text-destructive transition-colors gap-1.5 flex-1 sm:flex-none"
            >
              Clear Draft
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Analyze with AI Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAnalyzeAI}
            disabled={isAnalyzing || !editorText.trim()}
            className="text-xs h-9 gap-2 border-primary/40 text-primary hover:bg-primary/10 transition-colors flex-1 sm:flex-none"
            title="Derive insights, time audit, and stoic reflection with Groq AI"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reflecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Analyze with AI</span>
              </>
            )}
          </Button>

          {/* Delete Entry Alert */}
          {selectedDateEntry && onDeleteEntry && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors gap-1.5 flex-1 sm:flex-none border-border/80"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete your entry for{" "}
                    <strong className="text-foreground">
                      {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
                    </strong>
                    ? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteEntry}
                    className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Entry
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Primary Save Button */}
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || !editorText.trim()}
            className="text-xs h-9 px-5 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex-1 sm:flex-none"
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
    </div>
  );
};

export default DiaryEditor;
