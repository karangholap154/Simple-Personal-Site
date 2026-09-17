import { ExpenseStats, CATEGORY_COLORS } from "@/types/expenses";
import { Button } from "@/components/ui/button";
import { Sliders, PlusCircle, ShieldCheck } from "lucide-react";

interface Props {
  stats: ExpenseStats;
  onOpenBudgetModal: () => void;
}

export const CategoryBudgetBars = ({ stats, onOpenBudgetModal }: Props) => {
  const statuses = stats.categoryBudgetStatuses;

  const getBarColor = (pct: number) => {
    if (pct >= 100) return "bg-destructive";
    if (pct >= 85) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusBadge = (pct: number) => {
    if (pct >= 100) {
      return (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
          {pct}% (Over)
        </span>
      );
    }
    if (pct >= 85) {
      return (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
          {pct}%
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
        {pct}%
      </span>
    );
  };

  if (statuses.length === 0) {
    return (
      <div className="p-3.5 rounded-xl border border-dashed border-border/80 bg-card/40 flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
            <Sliders className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            Category Spending Caps
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            Set monthly limits to curb category leaks
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBudgetModal}
          className="text-xs h-7 px-2.5 whitespace-nowrap gap-1"
        >
          <PlusCircle className="w-3 h-3 text-primary" />
          Set Caps
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Category Spending Caps
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Active monthly ceilings
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenBudgetModal}
          className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
        >
          Manage
        </Button>
      </div>

      <div className="space-y-2.5">
        {statuses.map((item) => (
          <div
            key={item.category}
            className="p-2 sm:p-2.5 rounded-lg border border-border/50 bg-secondary/20 space-y-1.5 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748b" }}
                />
                <span className="text-xs font-medium text-foreground truncate">
                  {item.category}
                </span>
              </div>
              {getStatusBadge(item.percentage)}
            </div>

            {/* Slim 4px progress bar */}
            <div className="h-1 w-full bg-secondary/80 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${getBarColor(item.percentage)}`}
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono tabular-nums">
              <span>₹{item.spent.toLocaleString()} spent</span>
              <span>cap: ₹{item.budget.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBudgetBars;
