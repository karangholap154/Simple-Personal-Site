import React, { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Minimize2, Save, Star, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DiaryZenModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  editorText: string;
  onChangeText: (text: string) => void;
  isStarred: boolean;
  onToggleStar: () => void;
  isSaving: boolean;
  onSave: () => void;
  isCloudSaved: boolean;
  draftLastSaved: Date | null;
}

export const DiaryZenModal: React.FC<DiaryZenModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  editorText,
  onChangeText,
  isStarred,
  onToggleStar,
  isSaving,
  onSave,
  isCloudSaved,
  draftLastSaved,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && isOpen) {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSave]);

  if (!isOpen) return null;

  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 180);

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col animate-in fade-in duration-200">
      {/* Zen Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-foreground">
            {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
          </span>
          {isCloudSaved ? (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Saved in Cloud
            </span>
          ) : draftLastSaved ? (
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
              <RotateCcw className="w-3 h-3" /> Draft locally saved
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-2">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleStar}
            className={`h-8 text-xs gap-1.5 ${isStarred ? "text-amber-400" : "text-muted-foreground"}`}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-amber-400" : ""}`} />
            <span className="hidden sm:inline">{isStarred ? "Starred" : "Star"}</span>
          </Button>

          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !editorText.trim()}
            className="h-8 text-xs gap-1.5 px-3.5 font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs gap-1.5 border-border/70"
            title="Exit Zen Mode (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen</span>
          </Button>
        </div>
      </header>

      {/* Zen Textarea */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col">
        <Textarea
          autoFocus
          value={editorText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Start typing your evening reflection freely in complete stillness..."
          className="flex-1 w-full p-0 text-base sm:text-lg leading-relaxed bg-transparent border-0 focus-visible:ring-0 resize-none font-normal placeholder:text-muted-foreground/35 tracking-normal"
        />
      </main>

      {/* Zen Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-3 flex items-center justify-between text-[11px] text-muted-foreground/70 border-t border-border/20">
        <span>Authentic Words Sanctuary</span>
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-mono">Esc</kbd> to return</span>
      </footer>
    </div>
  );
};

export default DiaryZenModal;
