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
import { Wallet, PieChart } from "lucide-react";

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
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Budget Settings & Caps
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <Tabs defaultValue="overall" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="overall" className="text-xs flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                Overall Budget
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" />
                Category Caps
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
                    min="500"
                    step="500"
                    required
                    value={overallBudget}
                    onChange={(e) => setOverallBudget(e.target.value)}
                    className="pl-7 font-bold text-lg"
                  />
                </div>
              </div>

              {totalCategoryAllocated > 0 && (
                <div className="p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Category caps allocated:</span>
                  <span className="font-semibold text-foreground">
                    ₹{totalCategoryAllocated.toLocaleString()} / ₹{parseFloat(overallBudget || "0").toLocaleString()}
                  </span>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Category Spending Caps */}
            <TabsContent value="categories" className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p className="leading-tight">
                  Set optional monthly spending ceilings for high-leak categories.
                </p>
                {totalCategoryAllocated > 0 && (
                  <span className="font-semibold text-foreground whitespace-nowrap pl-2">
                    ₹{totalCategoryAllocated.toLocaleString()} cap
                  </span>
                )}
              </div>

              <div className="space-y-2.5 max-h-[38vh] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-xs font-medium text-foreground truncate">{cat}</span>
                    </div>

                    <div className="relative w-28 flex-shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="No cap"
                        value={categoryInputs[cat] || ""}
                        onChange={(e) => handleCategoryChange(cat, e.target.value)}
                        className="pl-6 h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Budgets & Caps</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default BudgetSettingsModal;
