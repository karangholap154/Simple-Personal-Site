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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (newBudget: number) => void;
}

export const BudgetSettingsModal = ({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
}: Props) => {
  const [budget, setBudget] = useState<string>(currentBudget.toString());

  useEffect(() => {
    setBudget(currentBudget.toString());
  }, [currentBudget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budget);
    if (!isNaN(val) && val > 0) {
      onSaveBudget(val);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Monthly Budget Limit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">
            Set your target monthly spending limit to monitor your daily burn rate and progress gauge.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Monthly Limit (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ₹
              </span>
              <Input
                type="number"
                min="500"
                step="500"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-7 font-bold text-lg"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Budget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default BudgetSettingsModal;
