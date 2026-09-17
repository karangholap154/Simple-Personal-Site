import { useState } from "react";
import { ExpenseStats } from "@/types/expenses";
import { AlertTriangle, Zap, X, ShieldAlert, Sliders, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  stats: ExpenseStats;
  onOpenBudgetModal: () => void;
}

export const ExpenseAlertBanner = ({ stats, onOpenBudgetModal }: Props) => {
  const [spikeDismissed, setSpikeDismissed] = useState(false);
  const [dismissedCategories, setDismissedCategories] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const dismissCategory = (cat: string) => {
    setDismissedCategories((prev) => ({ ...prev, [cat]: true }));
  };

  const activeOverCategories = stats.overBudgetCategories.filter(
    (c) => !dismissedCategories[c.category]
  );
  const activeNearCategories = stats.nearBudgetCategories.filter(
    (c) => !dismissedCategories[c.category]
  );

  const showSpike = stats.hasSpikeToday && !spikeDismissed;
  const totalAlerts = (showSpike ? 1 : 0) + activeOverCategories.length + activeNearCategories.length;

  if (totalAlerts === 0) {
    return null;
  }

  const hasCritical = showSpike || activeOverCategories.length > 0;
  const themeClass = hasCritical
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : "border-amber-500/40 bg-amber-500/10 text-amber-500";

  return (
    <div className={`rounded-xl border ${themeClass} overflow-hidden shadow-sm transition-all duration-200`}>
      {/* Compact Header Pill Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-background/50 flex-shrink-0">
            {showSpike ? (
              <Zap className="w-3.5 h-3.5 text-destructive" />
            ) : activeOverCategories.length > 0 ? (
              <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>

          <div className="font-medium text-foreground truncate">
            {showSpike && (
              <span>
                Daily spike: Spent <strong className="text-destructive">₹{stats.todayTotal.toLocaleString()}</strong> today (+₹{stats.todayPaceDiff.toLocaleString()} over pace)
              </span>
            )}
            {!showSpike && activeOverCategories.length > 0 && (
              <span>
                Cap exceeded in <strong className="text-destructive">{activeOverCategories[0].category}</strong> ({activeOverCategories[0].percentage}%)
                {activeOverCategories.length > 1 && ` +${activeOverCategories.length - 1} more`}
              </span>
            )}
            {!showSpike && activeOverCategories.length === 0 && activeNearCategories.length > 0 && (
              <span>
                Near cap in <strong className="text-amber-500">{activeNearCategories[0].category}</strong> ({activeNearCategories[0].percentage}%)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {totalAlerts > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
            >
              <span>{totalAlerts} alerts</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenBudgetModal}
            className="h-7 text-[11px] px-2 text-foreground/80 hover:text-foreground gap-1"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Adjust Caps</span>
          </Button>

          <button
            onClick={() => {
              if (showSpike) setSpikeDismissed(true);
              const dis: Record<string, boolean> = {};
              activeOverCategories.forEach((c) => (dis[c.category] = true));
              activeNearCategories.forEach((c) => (dis[c.category] = true));
              setDismissedCategories((prev) => ({ ...prev, ...dis }));
            }}
            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
            title="Dismiss all alerts"
            aria-label="Dismiss all alerts"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Multi-Alert Details Drawer */}
      {isExpanded && totalAlerts > 1 && (
        <div className="px-3.5 pb-3 pt-1 border-t border-border/40 space-y-2 bg-background/20 text-xs animate-in fade-in-50">
          {showSpike && (
            <div className="flex items-center justify-between text-muted-foreground py-1">
              <span>
                ⚡ Daily safe pace was ₹{stats.safeDailyBudget.toLocaleString()}. Main spend: {stats.todaySpikeReason?.category || "Outflow"}.
              </span>
              <button
                onClick={() => setSpikeDismissed(true)}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeOverCategories.map((c) => (
            <div key={c.category} className="flex items-center justify-between text-muted-foreground py-1">
              <span>
                🚨 <strong className="text-foreground">{c.category}</strong>: ₹{c.spent.toLocaleString()} spent of ₹{c.budget.toLocaleString()} cap ({c.percentage}%).
              </span>
              <button
                onClick={() => dismissCategory(c.category)}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          ))}

          {activeNearCategories.map((c) => (
            <div key={c.category} className="flex items-center justify-between text-muted-foreground py-1">
              <span>
                ⚠️ <strong className="text-foreground">{c.category}</strong>: ₹{c.spent.toLocaleString()} / ₹{c.budget.toLocaleString()} ({c.remaining.toLocaleString()} left for {stats.daysRemaining} days).
              </span>
              <button
                onClick={() => dismissCategory(c.category)}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseAlertBanner;
