import { ExpenseStats } from "@/types/expenses";
import { CATEGORY_COLORS } from "@/types/expenses";
import { DollarSign, Calendar, TrendingUp, PieChart, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Props {
  stats: ExpenseStats;
  onOpenBudgetModal: () => void;
}

export const ExpenseSummaryCards = ({ stats, onOpenBudgetModal }: Props) => {
  // Budget status color
  const getBudgetColor = (pct: number) => {
    if (pct >= 90) return "text-destructive";
    if (pct >= 75) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Spend */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Spent Today</span>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          ₹{stats.todayTotal.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.todayCount} transaction{stats.todayCount === 1 ? "" : "s"} logged today
        </p>
      </div>

      {/* This Month's Spend & Budget */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenBudgetModal}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Change Monthly Budget"
              aria-label="Change Monthly Budget"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          ₹{stats.monthTotal.toLocaleString()}
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">
              Budget: ₹{stats.monthlyBudget.toLocaleString()}
            </span>
            <span className={`font-medium ${getBudgetColor(stats.budgetPercentage)}`}>
              {stats.budgetPercentage}% used
            </span>
          </div>
          <Progress value={stats.budgetPercentage} className="h-1.5" />
        </div>
      </div>

      {/* Daily Average */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Daily Average</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          ₹{stats.averageDaily.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground ml-1">/ day</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on {stats.monthCount} items this month
        </p>
      </div>

      {/* Top Category */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Top Category</span>
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        {stats.topCategory ? (
          <>
            <div className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[stats.topCategory.category] }}
              />
              <span className="truncate">{stats.topCategory.category}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{stats.topCategory.amount.toLocaleString()} spent this month
            </p>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">No data yet</div>
            <p className="text-xs text-muted-foreground mt-1">Add expenses to see breakdown</p>
          </>
        )}
      </div>
    </div>
  );
};
export default ExpenseSummaryCards;
