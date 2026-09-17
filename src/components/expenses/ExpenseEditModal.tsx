import { useState, useEffect } from "react";
import { ExpenseItem, ExpenseCategory, PaymentMethod, ExpenseType, CATEGORY_COLORS, EXPENSE_TYPE_LABELS } from "@/types/expenses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

interface Props {
  expense: ExpenseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: Partial<ExpenseItem>) => Promise<boolean>;
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

const PAYMENT_METHODS: PaymentMethod[] = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Cash",
  "NetBanking",
];

export const ExpenseEditModal = ({ expense, isOpen, onClose, onSave }: Props) => {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<ExpenseCategory>("Food & Dining");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [expenseType, setExpenseType] = useState<ExpenseType>("need");
  const [notes, setNotes] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setPaymentMethod(expense.payment_method);
      setExpenseType(expense.expense_type || "need");
      setNotes(expense.notes || "");
      try {
        setDate(format(parseISO(expense.date), "yyyy-MM-dd"));
      } catch {
        setDate(format(new Date(), "yyyy-MM-dd"));
      }
    }
  }, [expense]);

  if (!expense) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setSaving(true);
    const success = await onSave(expense.id, {
      amount: numAmount,
      category,
      payment_method: paymentMethod,
      expense_type: expenseType,
      notes: notes.trim(),
      date: new Date(date).toISOString(),
    });

    if (success) {
      onClose();
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ₹
              </span>
              <Input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 font-bold"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span>{cat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classification (Need / Want / Investment) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Classification</label>
            <div className="grid grid-cols-3 gap-2">
              {(["need", "want", "investment"] as ExpenseType[]).map((t) => {
                const isSelected = expenseType === t;
                const meta = EXPENSE_TYPE_LABELS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExpenseType(t)}
                    title={meta.description}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? meta.activeClass
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Description"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm bg-secondary/50 border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default ExpenseEditModal;
