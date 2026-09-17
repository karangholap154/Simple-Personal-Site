import { ExpenseStats, CATEGORY_COLORS } from "@/types/expenses";
import {
  Calendar,
  Settings,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Coins,
  Scale,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

  const isUnderPace = stats.todayPaceStatus === "under" || stats.todayPaceStatus === "exact";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Safe-to-Spend Today & Daily Pace */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Pace</span>
            <div
              className={`p-2 rounded-lg ${
                isUnderPace
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {isUnderPace ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-1.5">
            ₹{stats.todayTotal.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">
              / ₹{stats.safeDailyBudget.toLocaleString()} safe
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-medium text-[11px] px-2 py-0.5 rounded-full ${
                isUnderPace
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {isUnderPace ? (
                <>
                  <span>✓</span>
                  <span>₹{stats.todayPaceDiff.toLocaleString()} under daily pace</span>
                </>
              ) : (
                <>
                  <span>!</span>
                  <span>₹{stats.todayPaceDiff.toLocaleString()} over pace</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {stats.daysRemaining} day{stats.daysRemaining === 1 ? "" : "s"} left in month
          </p>
        </div>
      </div>

      {/* 2. Monthly Budget & Run Rate */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
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
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">
              Remaining: ₹{stats.remainingBudget.toLocaleString()}
            </span>
            <span className={`font-medium ${getBudgetColor(stats.budgetPercentage)}`}>
              {stats.budgetPercentage}% used
            </span>
          </div>
          <Progress value={stats.budgetPercentage} className="h-1.5" />
        </div>
      </div>

      {/* 3. Conscious Spending: Needs vs Wants */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Wants (Discretionary)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-1.5">
            ₹{stats.wantsTotal.toLocaleString()}
            <span className="text-xs font-normal text-amber-400 font-medium">
              ({stats.wantsPercentage}% of total)
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Needs: ₹{stats.needsTotal.toLocaleString()}
            </span>
            {stats.investmentTotal > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Invest: ₹{stats.investmentTotal.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Primary lever to cut unnecessary spending
          </p>
        </div>
      </div>

      {/* 4. Micro-Spend Leakage (<= ₹200) */}
      <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Micro-Leaks (≤ ₹200)</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-1.5">
            ₹{stats.microSpendTotal.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">
              ({stats.microSpendPercentage}%)
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {stats.microSpendCount} small transaction{stats.microSpendCount === 1 ? "" : "s"}
            </span>
            <span className="text-violet-400 font-medium">Silent leak</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Chai, snacks & quick UPI micro-spends
          </p>
        </div>
      </div>
    </div>
  );
};
export default ExpenseSummaryCards;

