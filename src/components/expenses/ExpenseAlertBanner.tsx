import { useState } from "react";
import { ExpenseStats } from "@/types/expenses";
import { AlertTriangle, Zap, X, ShieldAlert, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  stats: ExpenseStats;
  onOpenBudgetModal: () => void;
}

export const ExpenseAlertBanner = ({ stats, onOpenBudgetModal }: Props) => {
  const [spikeDismissed, setSpikeDismissed] = useState(false);
  const [dismissedCategories, setDismissedCategories] = useState<Record<string, boolean>>({});

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
  const showCategoryAlerts = activeOverCategories.length > 0 || activeNearCategories.length > 0;

  if (!showSpike && !showCategoryAlerts) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {/* 1. Daily Spike Warning */}
      {showSpike && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-foreground flex items-start justify-between gap-3 shadow-sm animate-in fade-in-50">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-destructive/20 text-destructive mt-0.5 flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-semibold text-destructive flex items-center gap-1.5">
                <span>Daily Spending Spike Detected</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You spent <span className="font-semibold text-foreground">₹{stats.todayTotal.toLocaleString()}</span> today, which is{" "}
                <span className="font-semibold text-destructive">₹{stats.todayPaceDiff.toLocaleString()}</span> over your safe pace of ₹{stats.safeDailyBudget.toLocaleString()}/day.
                {stats.todaySpikeReason && (
                  <span>
                    {" "}Main driver: <strong className="text-foreground">{stats.todaySpikeReason.category}</strong> (₹{stats.todaySpikeReason.amount.toLocaleString()}).
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSpikeDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
            title="Dismiss alert"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Category Over-Budget Alert */}
      {activeOverCategories.map((c) => (
        <div
          key={c.category}
          className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-foreground flex items-start justify-between gap-3 shadow-sm animate-in fade-in-50"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-destructive/20 text-destructive mt-0.5 flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-semibold text-destructive flex items-center gap-1.5">
                <span>Category Cap Exceeded: {c.category}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Spent <span className="font-semibold text-foreground">₹{c.spent.toLocaleString()}</span> of your ₹{c.budget.toLocaleString()} monthly cap (
                <strong className="text-destructive">{c.percentage}% consumed</strong>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenBudgetModal}
              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
            >
              <Sliders className="w-3 h-3 mr-1" />
              Adjust
            </Button>
            <button
              onClick={() => dismissCategory(c.category)}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              title="Dismiss alert"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* 3. Category Near-Budget Alert (>= 85%) */}
      {activeNearCategories.map((c) => (
        <div
          key={c.category}
          className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-foreground flex items-start justify-between gap-3 shadow-sm animate-in fade-in-50"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-500 mt-0.5 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-semibold text-amber-500 flex items-center gap-1.5">
                <span>Near Category Limit: {c.category}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">₹{c.spent.toLocaleString()}</span> of ₹{c.budget.toLocaleString()} spent ({c.percentage}% used).{" "}
                Only <strong className="text-foreground">₹{c.remaining.toLocaleString()}</strong> remaining for {stats.daysRemaining} days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenBudgetModal}
              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
            >
              <Sliders className="w-3 h-3 mr-1" />
              Adjust
            </Button>
            <button
              onClick={() => dismissCategory(c.category)}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              title="Dismiss alert"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ExpenseAlertBanner;
