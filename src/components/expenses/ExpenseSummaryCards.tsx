import { ExpenseStats } from "@/types/expenses";
import {
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Scale,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  stats: ExpenseStats;
  onOpenBudgetModal: () => void;
}

export const ExpenseSummaryCards = ({ stats, onOpenBudgetModal }: Props) => {
  const getBudgetColor = (pct: number) => {
    if (pct >= 90) return "text-destructive";
    if (pct >= 75) return "text-amber-500";
    return "text-emerald-500";
  };

  const isUnderPace = stats.todayPaceStatus === "under" || stats.todayPaceStatus === "exact";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Safe-to-Spend Today & Daily Pace */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-border transition-all">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Today's Pace</span>
            <div
              className={`p-1.5 rounded-md ${
                isUnderPace
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {isUnderPace ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums font-mono truncate">
            ₹{stats.todayTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
            safe: <span className="text-foreground/80 font-medium">₹{stats.safeDailyBudget.toLocaleString()}</span>/day
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span
              className={`inline-flex items-center gap-1 font-medium text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md truncate ${
                isUnderPace
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {isUnderPace ? (
                <span>✓ -₹{stats.todayPaceDiff.toLocaleString()}</span>
              ) : (
                <span>! +₹{stats.todayPaceDiff.toLocaleString()}</span>
              )}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {stats.daysRemaining}d left in month
          </p>
        </div>
      </div>

      {/* 2. Monthly Budget & Run Rate */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-border transition-all">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">This Month</span>
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenBudgetModal}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Change Monthly Budget"
                aria-label="Change Monthly Budget"
              >
                <Settings className="w-3 h-3" />
              </button>
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums font-mono truncate">
            ₹{stats.monthTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
            rem: <span className="text-foreground/80 font-medium">₹{stats.remainingBudget.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1.5">
          <div className="flex justify-between text-[10px] sm:text-[11px]">
            <span className="text-muted-foreground truncate">Cap: ₹{stats.monthlyBudget.toLocaleString()}</span>
            <span className={`font-semibold ml-1 ${getBudgetColor(stats.budgetPercentage)}`}>
              {stats.budgetPercentage}%
            </span>
          </div>
          <Progress value={stats.budgetPercentage} className="h-1.5" />
        </div>
      </div>

      {/* 3. Discretionary Spending: Needs vs Wants */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-border transition-all">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Wants (Flex)</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums font-mono truncate">
            ₹{stats.wantsTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-0.5 truncate">
            {stats.wantsPercentage}% of total outflow
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Needs: ₹{stats.needsTotal.toLocaleString()}
            </span>
            {stats.investmentTotal > 0 && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Inv: ₹{stats.investmentTotal.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Cut here to boost savings
          </p>
        </div>
      </div>

      {/* 4. Micro-Spend Leakage (<= ₹200) */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-border transition-all">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Micro-Leaks</span>
            <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500">
              <Coffee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums font-mono truncate">
            ₹{stats.microSpendTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-violet-400 font-medium mt-0.5 truncate">
            {stats.microSpendPercentage}% ({stats.microSpendCount} txns ≤ ₹200)
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="text-muted-foreground">Silent leak</span>
            <span className="text-foreground/80 font-medium">Chai & snacks</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            High volume, low ticket spends
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummaryCards;

