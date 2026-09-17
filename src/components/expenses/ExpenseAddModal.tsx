import { useState } from "react";
import { ExpenseCategory, PaymentMethod, ExpenseType, CATEGORY_COLORS, EXPENSE_TYPE_LABELS } from "@/types/expenses";
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
import { Plus, Wallet } from "lucide-react";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (item: {
    amount: number;
    category: ExpenseCategory;
    payment_method: PaymentMethod;
    expense_type: ExpenseType;
    notes: string;
    date: string;
  }) => Promise<boolean>;
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

export const ExpenseAddModal = ({ isOpen, onClose, onAddExpense }: Props) => {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<ExpenseCategory>("Food & Dining");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [expenseType, setExpenseType] = useState<ExpenseType>("need");
  const [notes, setNotes] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setSubmitting(true);
    const success = await onAddExpense({
      amount: numAmount,
      category,
      payment_method: paymentMethod,
      expense_type: expenseType,
      notes: notes.trim(),
      date: new Date(date).toISOString(),
    });

    if (success) {
      setAmount("");
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[88dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wallet className="w-5 h-5 text-primary" />
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ₹
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 font-bold text-base h-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
              <SelectTrigger className="h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs sm:text-sm">
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
              <SelectTrigger className="h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method} className="text-xs sm:text-sm">
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classification (Need / Want / Investment) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Classification</label>
            <div className="grid grid-cols-3 gap-1.5 bg-secondary/30 p-1 rounded-lg border border-border/50">
              {(["need", "want", "investment"] as ExpenseType[]).map((t) => {
                const isSelected = expenseType === t;
                const meta = EXPENSE_TYPE_LABELS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExpenseType(t)}
                    title={meta.description}
                    className={`py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-medium border text-center transition-all truncate ${
                      isSelected
                        ? meta.activeClass
                        : "border-border/40 bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Notes / Description</label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Swiggy dinner, domain renewal"
              className="h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 text-xs sm:text-sm bg-secondary/50 border border-border rounded-md px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="w-full sm:w-auto h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !amount} className="w-full sm:w-auto h-9">
              {submitting ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseAddModal;
