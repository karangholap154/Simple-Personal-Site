import { useState } from "react";
import {
  ExpenseCategory,
  PaymentMethod,
  ExpenseType,
  CATEGORY_COLORS,
  EXPENSE_TYPE_LABELS,
} from "@/types/expenses";
import { parseBulkExpensesWithGroq, ParsedExpenseAI } from "@/lib/groq";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddBulkExpenses: (
    items: {
      amount: number;
      category: ExpenseCategory;
      payment_method: PaymentMethod;
      expense_type: ExpenseType;
      notes: string;
      date: string;
    }[]
  ) => Promise<boolean>;
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

const EXAMPLE_BULK_INPUT = `500 Pizza with friends UPI Yesterday
120 Auto to station Cash
2500 Electricity Bill NetBanking 25 Oct
60 Morning chai & biscuit Cash
1499 Running shoes Shopping Credit Card`;

export const BulkExpenseModal = ({ isOpen, onClose, onAddBulkExpenses }: Props) => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedExpenseAI[] | null>(null);

  const handleReset = () => {
    setInputText("");
    setParsedItems(null);
    setParsing(false);
    setSaving(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleParse = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      toast({
        title: "Input required",
        description: "Please type or paste your expenses first.",
        variant: "destructive",
      });
      return;
    }

    setParsing(true);
    try {
      const results = await parseBulkExpensesWithGroq(trimmed);
      setParsedItems(results);
      toast({
        title: "Expenses Parsed!",
        description: `Identified ${results.length} expense ${results.length === 1 ? "item" : "items"}. Review below before saving.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse expenses";
      toast({
        title: "Parsing Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleUpdateItem = <K extends keyof ParsedExpenseAI>(
    index: number,
    field: K,
    value: ParsedExpenseAI[K]
  ) => {
    if (!parsedItems) return;
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], [field]: value };
    setParsedItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (!parsedItems) return;
    const updated = parsedItems.filter((_, i) => i !== index);
    setParsedItems(updated.length > 0 ? updated : null);
  };

  const handleAddNewItem = () => {
    const newItem: ParsedExpenseAI = {
      amount: 0,
      category: "Food & Dining",
      payment_method: "UPI",
      expense_type: "need",
      notes: "New Expense",
      date: format(new Date(), "yyyy-MM-dd"),
    };
    setParsedItems((prev) => (prev ? [...prev, newItem] : [newItem]));
  };

  const handleSaveAll = async () => {
    if (!parsedItems || parsedItems.length === 0) return;

    // Validate that all items have positive amounts
    const validItems = parsedItems.filter((item) => Number(item.amount) > 0);
    if (validItems.length === 0) {
      toast({
        title: "Invalid amounts",
        description: "All expenses must have an amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const success = await onAddBulkExpenses(
        validItems.map((item) => ({
          amount: Number(item.amount),
          category: item.category,
          payment_method: item.payment_method,
          expense_type: item.expense_type,
          notes: item.notes.trim() || "Bulk Expense",
          date: item.date || new Date().toISOString(),
        }))
      );

      if (success) {
        handleClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const totalSum = parsedItems
    ? parsedItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  Bulk Add Expenses
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider py-0 px-1.5">
                    AI Powered
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste multiple entries, SMS logs, or shorthand notes. Different dates & categories supported.
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {!parsedItems ? (
            /* STEP 1: Textarea Input */
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-card/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Recommended Format (one per line):
                  </span>
                  <button
                    type="button"
                    onClick={() => setInputText(EXAMPLE_BULK_INPUT)}
                    className="text-[11px] text-primary hover:underline font-mono"
                  >
                    Paste sample data
                  </button>
                </div>
                <div className="font-mono text-[11px] p-2.5 rounded-lg bg-muted/60 text-muted-foreground border border-border/40 select-all">
                  <code>[Amount] [Item Description] [Payment Method] [Date]</code>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Enter expenses:</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {inputText.split("\n").filter((l) => l.trim()).length} lines
                  </span>
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Example:\n500 Pizza UPI Yesterday\n120 Uber Cash\n2500 Electricity NetBanking 25 Oct\n60 Chai & snacks`}
                  rows={8}
                  className="font-mono text-xs sm:text-sm resize-none bg-background/50 focus-visible:ring-primary/40 leading-relaxed"
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground">
                <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Dates can be relative (e.g. <em>yesterday</em>, <em>last Friday</em>) or explicit (e.g. <em>25 Oct</em>). If no date is given, today is used. You'll get to preview and modify every item before saving.
                </span>
              </div>
            </div>
          ) : (
            /* STEP 2: Preview & Editing Table */
            <div className="space-y-4">
              {/* Review Header Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground">
                    Ready to save: <strong className="text-primary">{parsedItems.length}</strong> {parsedItems.length === 1 ? "expense" : "expenses"}
                  </span>
                </div>
                <div className="text-xs font-semibold text-foreground font-mono bg-background/80 px-2.5 py-1 rounded-md border border-border/50">
                  Total: ₹{totalSum.toLocaleString()}
                </div>
              </div>

              {/* Editable Items List */}
              <div className="space-y-2.5">
                {parsedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/70 bg-card/60 hover:border-border transition-all space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      {/* Date */}
                      <div className="sm:col-span-3">
                        <Input
                          type="date"
                          value={item.date}
                          onChange={(e) => handleUpdateItem(idx, "date", e.target.value)}
                          className="h-8 text-xs font-mono bg-background"
                        />
                      </div>

                      {/* Notes / Description */}
                      <div className="sm:col-span-6">
                        <Input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(idx, "notes", e.target.value)}
                          placeholder="Description / Merchant"
                          className="h-8 text-xs bg-background"
                        />
                      </div>

                      {/* Amount */}
                      <div className="sm:col-span-3 flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            type="number"
                            min="1"
                            step="any"
                            value={item.amount || ""}
                            onChange={(e) =>
                              handleUpdateItem(idx, "amount", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="h-8 text-xs pl-6 font-mono font-semibold bg-background"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(idx)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Metadata Row: Category, Payment Method, Type */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
                      {/* Category */}
                      <div>
                        <Select
                          value={item.category}
                          onValueChange={(val: ExpenseCategory) =>
                            handleUpdateItem(idx, "category", val)
                          }
                        >
                          <SelectTrigger className="h-7 text-[11px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-xs">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                                  />
                                  {cat}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <Select
                          value={item.payment_method}
                          onValueChange={(val: PaymentMethod) =>
                            handleUpdateItem(idx, "payment_method", val)
                          }
                        >
                          <SelectTrigger className="h-7 text-[11px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method} value={method} className="text-xs">
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Expense Type */}
                      <div>
                        <Select
                          value={item.expense_type}
                          onValueChange={(val: ExpenseType) =>
                            handleUpdateItem(idx, "expense_type", val)
                          }
                        >
                          <SelectTrigger className="h-7 text-[11px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="need" className="text-xs">
                              {EXPENSE_TYPE_LABELS.need.label}
                            </SelectItem>
                            <SelectItem value="want" className="text-xs">
                              {EXPENSE_TYPE_LABELS.want.label}
                            </SelectItem>
                            <SelectItem value="investment" className="text-xs">
                              {EXPENSE_TYPE_LABELS.investment.label}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add row manually button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewItem}
                className="w-full text-xs h-8 border-dashed border-border/80 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Row Manually
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="pt-3 border-t border-border/60 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between items-center">
          {!parsedItems ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-xs h-8 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleParse}
                disabled={parsing || !inputText.trim()}
                className="text-xs h-8 gap-1.5 font-medium w-full sm:w-auto"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Parse Expenses ({inputText.split("\n").filter((l) => l.trim()).length || 0})
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setParsedItems(null)}
                className="text-xs h-8 gap-1.5 w-full sm:w-auto"
                disabled={saving}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Edit Text
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={saving}
                  className="text-xs h-8 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={saving || parsedItems.length === 0}
                  className="text-xs h-8 gap-1.5 font-medium shadow-xs w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving to Cloud...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Save All ({parsedItems.length}) to Cloud
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkExpenseModal;
