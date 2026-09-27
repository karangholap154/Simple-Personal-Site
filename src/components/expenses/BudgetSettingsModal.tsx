import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseCategory, CategoryBudgets, CATEGORY_COLORS } from "@/types/expenses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, PieChart, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  categoryBudgets: CategoryBudgets;
  onSaveBudget: (newBudget: number) => void;
  onSaveCategoryBudgets: (newBudgets: CategoryBudgets) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  "Food & Dining",
  "Transport & Travel",
  "Tech & Hosting",
  "Bills & Utilities",
  "Shopping",
  "Entertainment",
  "Education & Books",
  "Health & Fitness",
  "Other",
];

export const BudgetSettingsModal = ({
  isOpen,
  onClose,
  currentBudget,
  categoryBudgets,
  onSaveBudget,
  onSaveCategoryBudgets,
}: Props) => {
  const [overallBudget, setOverallBudget] = useState<string>(currentBudget.toString());
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setOverallBudget(currentBudget.toString());
    const inputs: Record<string, string> = {};
    CATEGORIES.forEach((cat) => {
      const val = categoryBudgets[cat];
      inputs[cat] = val ? val.toString() : "";
    });
    setCategoryInputs(inputs);
  }, [currentBudget, categoryBudgets, isOpen]);

  const handleCategoryChange = (cat: string, val: string) => {
    setCategoryInputs((prev) => ({ ...prev, [cat]: val }));
  };

  const totalCategoryAllocated = Object.values(categoryInputs).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (!isNaN(num) && num > 0 ? num : 0);
  }, 0);

  const masterBudgetNum = parseFloat(overallBudget) || 0;
  const isOverflow = masterBudgetNum > 0 && totalCategoryAllocated > masterBudgetNum;
  const overflowDiff = Math.max(0, totalCategoryAllocated - masterBudgetNum);
  const unallocatedRemaining = Math.max(0, masterBudgetNum - totalCategoryAllocated);
  const allocationPercentage = masterBudgetNum > 0 ? Math.round((totalCategoryAllocated / masterBudgetNum) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(overallBudget);
    if (!isNaN(val) && val > 0) {
      onSaveBudget(val);
    }

    const cleanBudgets: CategoryBudgets = {};
    CATEGORIES.forEach((cat) => {
      const num = parseFloat(categoryInputs[cat]);
      if (!isNaN(num) && num > 0) {
        cleanBudgets[cat] = num;
      }
    });

    onSaveCategoryBudgets(cleanBudgets);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[88dvh] rounded-2xl sm:rounded-xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wallet className="w-5 h-5 text-primary" />
            Budget Settings & Caps
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <Tabs defaultValue="overall" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="overall" className="text-xs flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                Overall Budget
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" />
                Category Caps
                {isOverflow && (
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overall Budget */}
            <TabsContent value="overall" className="space-y-3 pt-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set your overall target monthly spending limit. This drives your daily safe pace coach and monthly progress bar.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Monthly Limit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="500"
                    step="500"
                    required
                    value={overallBudget}
                    onChange={(e) => setOverallBudget(e.target.value)}
                    className="pl-7 font-bold text-lg h-11"
                  />
                </div>
              </div>

              {totalCategoryAllocated > 0 && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-2 transition-colors ${
                    isOverflow
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border/80 bg-secondary/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold flex items-center gap-1.5">
                      {isOverflow ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                          <span className="text-destructive">Cap Allocation Overflow ({allocationPercentage}%)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-foreground">Category Caps Allocated ({allocationPercentage}%)</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      ₹{totalCategoryAllocated.toLocaleString()} / ₹{masterBudgetNum.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverflow ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, allocationPercentage)}%` }}
                    />
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    {isOverflow ? (
                      <span className="text-destructive font-medium">
                        ⚠️ Category caps exceed your monthly limit by <strong>₹{overflowDiff.toLocaleString()}</strong>. Consider adjusting individual ceilings or raising your overall budget.
                      </span>
                    ) : (
                      <span>
                        ✓ <strong>₹{unallocatedRemaining.toLocaleString()}</strong> remaining unallocated for flexible spending.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Category Spending Caps */}
            <TabsContent value="categories" className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-1.5">
                <p className="leading-tight">
                  Set optional monthly spending ceilings for high-leak categories.
                </p>
                {totalCategoryAllocated > 0 && (
                  <span
                    className={`font-semibold whitespace-nowrap font-mono self-start sm:self-auto px-2 py-0.5 rounded-md text-[11px] border ${
                      isOverflow
                        ? "bg-destructive/15 text-destructive border-destructive/30"
                        : "bg-secondary text-foreground border-border/60"
                    }`}
                  >
                    ₹{totalCategoryAllocated.toLocaleString()} {isOverflow ? `(+₹${overflowDiff.toLocaleString()} over)` : "capped"}
                  </span>
                )}
              </div>

              {/* Overflow warning banner in Category tab */}
              {isOverflow && (
                <div className="p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong>Ceiling Overflow Alert:</strong> Total category caps (₹{totalCategoryAllocated.toLocaleString()}) exceed your monthly budget (₹{masterBudgetNum.toLocaleString()}) by ₹{overflowDiff.toLocaleString()}.
                  </div>
                </div>
              )}

              <div className="space-y-2 pr-1">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-xs font-medium text-foreground truncate">{cat}</span>
                    </div>

                    <div className="relative w-24 sm:w-28 flex-shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-semibold">
                        ₹
                      </span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="100"
                        placeholder="No cap"
                        value={categoryInputs[cat] || ""}
                        onChange={(e) => handleCategoryChange(cat, e.target.value)}
                        className="pl-6 h-8 text-xs font-semibold font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-3 border-t border-border/40 flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto h-9">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto h-9">
              Save Budgets & Caps
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default BudgetSettingsModal;
