import { useState, useMemo, useEffect } from "react";
import { ExpenseItem, ExpenseCategory, ExpenseType, CATEGORY_COLORS, EXPENSE_TYPE_LABELS } from "@/types/expenses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Smartphone,
  Banknote,
  Globe,
  ChevronLeft,
  ChevronRight,
  Coffee,
  X,
  RotateCcw,
} from "lucide-react";
import {
  format,
  parseISO,
  isToday,
  isYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

interface Props {
  expenses: ExpenseItem[];
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string) => Promise<boolean>;
}

type DateFilter = "all" | "today" | "week" | "month";

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

const ITEMS_PER_PAGE = 12;

export const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedType, dateFilter]);

  const hasActiveFilters =
    search.trim() !== "" || selectedCategory !== "all" || selectedType !== "all" || dateFilter !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedType("all");
    setDateFilter("all");
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return expenses.filter((item) => {
      const itemDate = parseISO(item.date);
      const itemType = item.expense_type || "need";

      // Search match
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNote = item.notes?.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesPayment = item.payment_method.toLowerCase().includes(query);
        const matchesAmount = item.amount.toString().includes(query);
        const matchesType = itemType.toLowerCase().includes(query);
        if (!matchesNote && !matchesCategory && !matchesPayment && !matchesAmount && !matchesType) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== "all") {
        if (selectedType === "micro") {
          if (item.amount > 200) return false;
        } else if (itemType !== selectedType) {
          return false;
        }
      }

      // Date filter
      if (dateFilter === "today" && !isToday(itemDate)) {
        return false;
      }
      if (dateFilter === "week" && !isWithinInterval(itemDate, { start: weekStart, end: weekEnd })) {
        return false;
      }
      if (dateFilter === "month" && !isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        return false;
      }

      return true;
    });
  }, [expenses, search, selectedCategory, selectedType, dateFilter]);

  // Pagination calculations
  const totalItems = filteredExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, startIndex, endIndex]);

  // Group current page items by date string (yyyy-MM-dd)
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, { label: string; total: number; items: ExpenseItem[] }> = {};

    paginatedExpenses.forEach((item) => {
      const parsed = parseISO(item.date);
      const dateKey = format(parsed, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        let label = format(parsed, "EEEE, d MMM yyyy");
        if (isToday(parsed)) {
          label = `Today • ${format(parsed, "d MMM")}`;
        } else if (isYesterday(parsed)) {
          label = `Yesterday • ${format(parsed, "d MMM")}`;
        }

        groups[dateKey] = {
          label,
          total: 0,
          items: [],
        };
      }

      groups[dateKey].items.push(item);
      groups[dateKey].total += Number(item.amount);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [paginatedExpenses]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDeleteExpense(id);
    setDeletingId(null);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "UPI":
        return <Smartphone className="w-3 h-3 text-emerald-500" />;
      case "Credit Card":
      case "Debit Card":
        return <CreditCard className="w-3 h-3 text-blue-500" />;
      case "Cash":
        return <Banknote className="w-3 h-3 text-amber-500" />;
      default:
        return <Globe className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1-Row Unified Filter Toolbar */}
      <div className="p-2 sm:p-2.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        {/* Search Input with inline clear */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search note, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs bg-background/50 border-border/70"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Date Segmented Control */}
        <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border/60 self-stretch sm:self-auto justify-between">
          {(
            [
              { id: "all", label: "All" },
              { id: "today", label: "Today" },
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                dateFilter === filter.id
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Filter Dropdowns: Category & Classification */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          {/* Category Dropdown */}
          <div className="flex-1 sm:w-36">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8 text-xs bg-background/50 border-border/70">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Categories
                </SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="truncate">{cat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classification Dropdown */}
          <div className="flex-1 sm:w-32">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-8 text-xs bg-background/50 border-border/70">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Types
                </SelectItem>
                <SelectItem value="need" className="text-xs">
                  Needs
                </SelectItem>
                <SelectItem value="want" className="text-xs">
                  Wants
                </SelectItem>
                <SelectItem value="investment" className="text-xs">
                  Investments
                </SelectItem>
                <SelectItem value="micro" className="text-xs">
                  Micro-Leaks (≤ ₹200)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters button if active */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearAllFilters}
              className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Counter & Active Filter Badge */}
      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filteredExpenses.length}</strong> transaction{filteredExpenses.length === 1 ? "" : "s"}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-primary hover:underline text-[11px] font-medium"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Grouped Transactions List */}
      {groupedExpenses.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-border/80 bg-card/20">
          <Calendar className="w-7 h-7 mx-auto text-muted-foreground/40 mb-2" />
          <h4 className="text-xs font-semibold text-foreground">No matching expenses found</h4>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">
            {hasActiveFilters
              ? "Try resetting filters or adjusting search keyword."
              : "No expenses logged yet. Use the quick add bar above."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupedExpenses.map(([dateKey, group]) => (
            <div key={dateKey} className="space-y-1.5">
              {/* Group Subtotal Header */}
              <div className="flex items-center justify-between px-1.5 text-[11px]">
                <span className="font-semibold text-foreground/80 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {group.label}
                </span>
                <span className="font-mono text-muted-foreground">
                  Day Total: <span className="text-foreground font-semibold">₹{group.total.toLocaleString()}</span>
                </span>
              </div>

              {/* Dense Items Card */}
              <div className="rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm divide-y divide-border/40 overflow-hidden shadow-xs">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-secondary/25 transition-colors group"
                  >
                    {/* Left: Category dot + Note & Metadata */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748b" }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {item.notes || item.category}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            {getPaymentIcon(item.payment_method)}
                            {item.payment_method}
                          </span>
                          <span>•</span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium border ${
                              EXPENSE_TYPE_LABELS[item.expense_type || "need"]?.badgeClass ||
                              "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {EXPENSE_TYPE_LABELS[item.expense_type || "need"]?.label || "Need"}
                          </span>
                          {Number(item.amount) <= 200 && (
                            <span
                              title="Micro-transaction ≤ ₹200"
                              className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            >
                              <Coffee className="w-2.5 h-2.5" />
                              ≤₹200
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-foreground font-mono tabular-nums">
                        ₹{Number(item.amount).toLocaleString()}
                      </div>

                      <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditExpense(item)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Compact Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground order-2 sm:order-1">
                {startIndex + 1}–{endIndex} of {totalItems} items
              </span>

              <div className="flex items-center gap-1 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Prev</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return page === 1 || page === totalPages || Math.abs(page - validPage) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const hasGap = prevPage && page - prevPage > 1;

                      return (
                        <span key={page} className="flex items-center">
                          {hasGap && <span className="px-0.5 text-[10px] text-muted-foreground">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-xs font-medium transition-colors ${
                              validPage === page
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
