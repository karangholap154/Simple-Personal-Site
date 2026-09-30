import React from "react";
import { BookOpen, Flame, FileText, Lock, LogOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiaryHeaderProps {
  isAuthenticated: boolean;
  userEmail?: string;
  streak: number;
  totalEntries: number;
  onSignOut: () => void;
  onToggleZen: () => void;
}

export const DiaryHeader: React.FC<DiaryHeaderProps> = ({
  isAuthenticated,
  userEmail,
  streak,
  totalEntries,
  onSignOut,
  onToggleZen,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Personal Life Journal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A private evening sanctuary for your raw daily thoughts, emotions, work, and reflections.
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
          {isAuthenticated ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Encrypted Cloud Sync {userEmail ? `(${userEmail})` : ""}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary/80 text-muted-foreground border border-border/80">
                <Flame className="w-3 h-3 text-amber-500" />
                Streak: <strong className="text-foreground ml-0.5">{streak} {streak === 1 ? "day" : "days"}</strong>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary/80 text-muted-foreground border border-border/80">
                <FileText className="w-3 h-3 text-primary" />
                Total: <strong className="text-foreground ml-0.5">{totalEntries} entries</strong>
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary/80 text-muted-foreground border border-border">
              <Lock className="w-3 h-3 text-amber-400" />
              Private Sanctuary Access Only
            </span>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleZen}
            className="text-xs h-8 gap-1.5 border-border/80 hover:bg-secondary/60 transition-colors"
            title="Open Distraction-Free Zen Writer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Zen Mode</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="text-xs h-8 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors gap-1.5"
            title="Sign out of journal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiaryHeader;
