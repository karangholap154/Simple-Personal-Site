import { ExpenseStats, CATEGORY_COLORS } from "@/types/expenses";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sliders, ShieldCheck, AlertCircle, PlusCircle } from "lucide-react";

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

  const getStatusBadge = (pct: number, remaining: number) => {
    if (pct >= 100) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
          {pct}% (Over Cap)
        </span>
      );
    }
    if (pct >= 85) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          {pct}% (At Risk)
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        {pct}% (₹{remaining.toLocaleString()} left)
      </span>
    );
  };

  if (statuses.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border/80 bg-card/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Category Spending Caps (Micro-Budgets)
          </div>
          <p className="text-[11px] text-muted-foreground">
            Set monthly spending ceilings for categories like Food & Dining or Shopping to prevent overspending.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBudgetModal}
          className="text-xs h-8 whitespace-nowrap gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5 text-primary" />
          Set Category Caps
        </Button>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Category Spending Caps
          </h3>
          <p className="text-xs text-muted-foreground">
            Track micro-budgets and avoid month-end category overruns
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenBudgetModal}
          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          Manage Caps
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statuses.map((item) => (
          <div
            key={item.category}
            className="p-3 rounded-lg border border-border/60 bg-secondary/20 space-y-2 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748b" }}
                />
                <span className="text-xs font-semibold text-foreground truncate">
                  {item.category}
                </span>
              </div>
              {getStatusBadge(item.percentage, item.remaining)}
            </div>

            {/* Custom progress bar with custom color */}
            <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${getBarColor(item.percentage)}`}
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Spent: <strong className="text-foreground font-semibold">₹{item.spent.toLocaleString()}</strong>
              </span>
              <span>
                Cap: <strong className="text-foreground">₹{item.budget.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CategoryBudgetBars;
