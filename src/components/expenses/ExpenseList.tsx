import { useState, useMemo, useEffect } from "react";
import { ExpenseItem, ExpenseCategory, CATEGORY_COLORS } from "@/types/expenses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const ITEMS_PER_PAGE = 10;

export const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, dateFilter]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return expenses.filter((item) => {
      const itemDate = parseISO(item.date);

      // Search match
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNote = item.notes?.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesPayment = item.payment_method.toLowerCase().includes(query);
        const matchesAmount = item.amount.toString().includes(query);
        if (!matchesNote && !matchesCategory && !matchesPayment && !matchesAmount) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
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
  }, [expenses, search, selectedCategory, dateFilter]);

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
        let label = format(parsed, "EEEE, d MMMM yyyy");
        if (isToday(parsed)) {
          label = `Today (${format(parsed, "d MMM")})`;
        } else if (isYesterday(parsed)) {
          label = `Yesterday (${format(parsed, "d MMM")})`;
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
        return <Smartphone className="w-3 h-3 mr-1 text-emerald-500" />;
      case "Credit Card":
      case "Debit Card":
        return <CreditCard className="w-3 h-3 mr-1 text-blue-500" />;
      case "Cash":
        return <Banknote className="w-3 h-3 mr-1 text-amber-500" />;
      default:
        return <Globe className="w-3 h-3 mr-1 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Date Filter, Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search note, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary/40 border border-border rounded-lg self-stretch sm:self-auto justify-between sm:justify-start">
          {(
            [
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                dateFilter === filter.id
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Grouped Transactions List */}
      {groupedExpenses.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-card/20">
          <Calendar className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <h4 className="text-sm font-medium text-foreground">No expenses found</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== "all" || dateFilter !== "all"
              ? "Try adjusting your search query or filters."
              : "No expenses logged yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedExpenses.map(([dateKey, group]) => (
            <div key={dateKey} className="space-y-2">
              {/* Group Header */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-semibold text-foreground/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {group.label}
                </span>
                <span className="font-mono font-medium text-muted-foreground">
                  Subtotal: <span className="text-foreground font-semibold">₹{group.total.toLocaleString()}</span>
                </span>
              </div>

              {/* Items Card */}
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm divide-y divide-border/60 overflow-hidden shadow-sm">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors group"
                  >
                    {/* Left: Category dot + Note & Category */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748b" }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.notes || item.category}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            {getPaymentIcon(item.payment_method)}
                            {item.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-sm sm:text-base font-bold text-foreground">
                        ₹{Number(item.amount).toLocaleString()}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditExpense(item)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
              <span className="text-xs text-muted-foreground order-2 sm:order-1">
                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span>–<span className="font-semibold text-foreground">{endIndex}</span> of <span className="font-semibold text-foreground">{totalItems}</span> transactions
              </span>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>

                {/* Page Number Chips */}
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
                          {hasGap && <span className="px-1 text-xs text-muted-foreground">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-medium transition-colors ${
                              validPage === page
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
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
