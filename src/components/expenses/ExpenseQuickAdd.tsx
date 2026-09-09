import { useState } from "react";
import { ExpenseCategory, PaymentMethod, CATEGORY_COLORS } from "@/types/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface Props {
  onAddExpense: (item: {
    amount: number;
    category: ExpenseCategory;
    payment_method: PaymentMethod;
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

export const ExpenseQuickAdd = ({ onAddExpense }: Props) => {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<ExpenseCategory>("Food & Dining");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
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
      notes: notes.trim(),
      date: new Date(date).toISOString(),
    });

    if (success) {
      setAmount("");
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          {/* Amount */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                ₹
              </span>
              <Input
                type="number"
                step="any"
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 font-semibold"
              />
            </div>
          </div>

          {/* Category */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Category</label>
            <Select value={category} onValueChange={(val) => setCategory(val as ExpenseCategory)}>
              <SelectTrigger className="w-full">
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
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Payment</label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
              <SelectTrigger className="w-full">
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

          {/* Notes */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Notes / Description</label>
            <Input
              type="text"
              placeholder="e.g. Swiggy dinner, domain renewal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
          {/* Custom Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-auto text-xs bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || !amount}
            className="w-full sm:w-auto px-6 font-medium sm:ml-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {submitting ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default ExpenseQuickAdd;
