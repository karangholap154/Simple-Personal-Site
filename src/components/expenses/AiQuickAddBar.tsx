import { useState, useRef } from "react";
import { ExpenseCategory, PaymentMethod, ExpenseType, CATEGORY_COLORS, EXPENSE_TYPE_LABELS } from "@/types/expenses";
import { parseExpenseWithGroq, ParsedExpenseAI } from "@/lib/groq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { toLocalISOString } from "@/lib/utils";
import {
  Sparkles,
  Zap,
  Check,
  X,
  Loader2,
  Calendar,
  CreditCard,
  Tag,
  ArrowRight,
} from "lucide-react";

interface Props {
  onAddExpense: (item: {
    amount: number;
    category: ExpenseCategory;
    payment_method: PaymentMethod;
    expense_type: ExpenseType;
    notes: string;
    date: string;
  }) => Promise<boolean>;
  onOpenWithPrefill?: (prefill: ParsedExpenseAI) => void;
}

export const AiQuickAddBar = ({ onAddExpense, onOpenWithPrefill }: Props) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedItem, setParsedItem] = useState<ParsedExpenseAI | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleParse = async (textToParse?: string) => {
    const text = (textToParse ?? prompt).trim();
    if (!text) {
      toast({
        title: "Please enter an expense",
        description: "Type a sentence or paste a transaction SMS to parse.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setParsedItem(null);

    const startTime = performance.now();
    try {
      const result = await parseExpenseWithGroq(text);
      const durationMs = Math.round(performance.now() - startTime);

      setParsedItem(result);
      toast({
        title: `Parsed in ${durationMs}ms with Groq AI! ⚡`,
        description: `₹${result.amount} • ${result.category} • ${result.payment_method}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: "AI Parsing Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!parsedItem) return;

    setSaving(true);
    try {
      const success = await onAddExpense({
        amount: parsedItem.amount,
        category: parsedItem.category,
        payment_method: parsedItem.payment_method,
        expense_type: parsedItem.expense_type,
        notes: parsedItem.notes,
        date: toLocalISOString(parsedItem.date),
      });

      if (success) {
        setParsedItem(null);
        setPrompt("");
        toast({
          title: "Expense Logged via Groq AI! 🎉",
          description: `₹${parsedItem.amount} saved under ${parsedItem.category}.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to save expense",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (parsedItem) {
        handleConfirmAndSave();
      } else {
        handleParse();
      }
    } else if (e.key === "Escape") {
      setParsedItem(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-secondary/30 p-3.5 sm:p-4 backdrop-blur-md shadow-xs space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
            AI Magic Quick-Add
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
              <Zap className="w-2.5 h-2.5 fill-primary" /> Groq LPU Instant (~200ms)
            </span>
          </span>
        </div>
      </div>

      {/* Main input & Parse button */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || saving}
            placeholder="Type an expense or paste a transaction SMS..."
            className="h-10 text-xs sm:text-sm bg-background/80 pr-10 border-border/80 focus-visible:ring-primary shadow-inner"
          />
          {prompt && !loading && (
            <button
              type="button"
              onClick={() => {
                setPrompt("");
                setParsedItem(null);
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={() => handleParse()}
          disabled={loading || !prompt.trim()}
          className="h-10 text-xs gap-1.5 px-4 font-medium shrink-0 shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Parse AI
            </>
          )}
        </Button>
      </div>

      {/* AI Parsed Result Preview Card */}
      {parsedItem && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2.5 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                ₹{parsedItem.amount.toLocaleString()}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                style={{
                  borderColor: `${CATEGORY_COLORS[parsedItem.category]}40`,
                  backgroundColor: `${CATEGORY_COLORS[parsedItem.category]}15`,
                  color: CATEGORY_COLORS[parsedItem.category],
                }}
              >
                <Tag className="w-2.5 h-2.5" />
                {parsedItem.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-foreground border border-border">
                <CreditCard className="w-2.5 h-2.5 text-muted-foreground" />
                {parsedItem.payment_method}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  EXPENSE_TYPE_LABELS[parsedItem.expense_type].badgeClass
                }`}
              >
                {EXPENSE_TYPE_LABELS[parsedItem.expense_type].label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{parsedItem.date}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-border/40">
            <span className="text-foreground truncate flex-1 font-medium">
              Note: <span className="text-muted-foreground font-normal">{parsedItem.notes}</span>
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenWithPrefill && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenWithPrefill(parsedItem)}
                  className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                >
                  Edit in Modal
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setParsedItem(null)}
                disabled={saving}
                className="h-7 text-[11px] px-2 text-muted-foreground"
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="h-7 text-[11px] px-3 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Confirm & Add (Enter)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiQuickAddBar;
