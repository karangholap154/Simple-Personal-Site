import { useState, useMemo, useEffect, useRef } from "react";
import {
  ExpenseItem,
  ExpenseCategory,
  ExpenseType,
  CATEGORY_COLORS,
  EXPENSE_TYPE_LABELS,
} from "@/types/expenses";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  LayoutList,
  Table as TableIcon,
  UtensilsCrossed,
  Car,
  Laptop,
  Receipt,
  ShoppingBag,
  Gamepad2,
  BookOpen,
  Activity,
  Layers,
  Check,
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
type ViewMode = "cards" | "table";

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

const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case "Food & Dining":
      return <UtensilsCrossed className="w-3.5 h-3.5" />;
    case "Transport & Travel":
      return <Car className="w-3.5 h-3.5" />;
    case "Tech & Hosting":
      return <Laptop className="w-3.5 h-3.5" />;
    case "Bills & Utilities":
      return <Receipt className="w-3.5 h-3.5" />;
    case "Shopping":
      return <ShoppingBag className="w-3.5 h-3.5" />;
    case "Entertainment":
      return <Gamepad2 className="w-3.5 h-3.5" />;
    case "Education & Books":
      return <BookOpen className="w-3.5 h-3.5" />;
    case "Health & Fitness":
      return <Activity className="w-3.5 h-3.5" />;
    case "Other":
    default:
      return <Layers className="w-3.5 h-3.5" />;
  }
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

export const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearch("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedType, dateFilter, pageSize]);

  // Clean up delete timeout
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

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
        const matchesType = itemType.toLowerCase().query ? itemType.toLowerCase().includes(query) : false;
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
          if (Number(item.amount) > 200) return false;
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

  // Financial calculations
  const totalAllSpend = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [expenses]);

  const filteredTotalSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (selectedCategory !== "all") count++;
    if (selectedType !== "all") count++;
    if (dateFilter !== "all") count++;
    return count;
  }, [search, selectedCategory, selectedType, dateFilter]);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedType("all");
    setDateFilter("all");
  };

  // Pagination calculations
  const totalItems = filteredExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, startIndex, endIndex]);

  // Group current page items by date string (yyyy-MM-dd) for Cards view
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

  // Safe delete handler with 2-step inline confirmation
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    if (confirmDeleteId === id) {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      setConfirmDeleteId(null);
      setDeletingId(id);
      onDeleteExpense(id).finally(() => setDeletingId(null));
    } else {
      setConfirmDeleteId(id);
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 3500);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-3">
      {/* 1. Main Filter & Controls Toolbar */}
      <div className="p-2 sm:p-2.5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          {/* Search Input with Keyboard Shortcut & Clear */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-14 h-8.5 text-xs bg-background/60 border-border/70 rounded-lg focus-visible:ring-1"
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/60 pointer-events-none">
                /
              </span>
            )}
          </div>

          {/* Date Segmented Control */}
          <div className="flex items-center gap-0.5 bg-secondary/40 p-0.5 rounded-lg border border-border/60 self-stretch sm:self-auto justify-between sm:justify-start">
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
                className={`flex-1 sm:flex-initial px-2 sm:px-2.5 py-1 text-[11px] font-medium rounded-md transition-all text-center ${
                  dateFilter === filter.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Category & Classification Selects + View Switcher */}
          <div className="flex items-center gap-1.5 self-stretch sm:self-auto min-w-0">
            {/* Category Dropdown */}
            <div className="flex-1 sm:w-36 min-w-0 sm:flex-initial">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8.5 text-xs bg-background/60 border-border/70 rounded-lg">
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
            <div className="flex-1 sm:w-32 min-w-0 sm:flex-initial">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-8.5 text-xs bg-background/60 border-border/70 rounded-lg">
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

            {/* View Mode Switcher (Cards vs Table) */}
            <div className="flex items-center bg-secondary/40 p-0.5 rounded-lg border border-border/60 flex-shrink-0">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Comfortable card stream"
                aria-label="Cards view"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dense spreadsheet table"
                aria-label="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filtered Financial Intelligence Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong className="text-foreground">{filteredExpenses.length}</strong> of{" "}
            {expenses.length} transaction{expenses.length === 1 ? "" : "s"}
          </span>
          <span className="text-border">•</span>
          <span>
            Sum:{" "}
            <strong className="text-foreground font-mono tabular-nums">
              ₹{filteredTotalSpend.toLocaleString()}
            </strong>
            {activeFilterCount > 0 && totalAllSpend > 0 && (
              <span className="text-[11px] text-muted-foreground ml-1">
                ({Math.round((filteredTotalSpend / totalAllSpend) * 100)}% of all)
              </span>
            )}
          </span>
          {activeFilterCount > 0 && (
            <>
              <span className="text-border">•</span>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline font-medium"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            </>
          )}
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <div className="flex items-center gap-1 text-[11px]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-card border border-border/60 rounded px-1.5 py-0.5 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Transaction List / Table Area */}
      {filteredExpenses.length === 0 ? (
        /* Empty State */
        <div className="py-14 text-center rounded-2xl border border-dashed border-border/80 bg-card/30 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-2xl bg-secondary/60 text-muted-foreground mx-auto flex items-center justify-center mb-2.5 shadow-inner">
            <Calendar className="w-5 h-5 opacity-60" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No matching expenses found</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {activeFilterCount > 0
              ? "Try adjusting search query, category, or clearing active filters."
              : "No expenses logged yet. Tap '+ Add Expense' in the top header to log your first transaction."}
          </p>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="mt-3.5 h-8.5 text-xs gap-1.5 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters ({activeFilterCount})
            </Button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* Dense Spreadsheet Table View */
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-xs">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-border/60 text-[11px]">
                <TableHead className="w-[105px] py-2">Date</TableHead>
                <TableHead className="py-2">Description / Note</TableHead>
                <TableHead className="w-[140px] py-2">Category</TableHead>
                <TableHead className="w-[95px] py-2">Payment</TableHead>
                <TableHead className="w-[85px] py-2">Type</TableHead>
                <TableHead className="w-[100px] text-right py-2">Amount</TableHead>
                <TableHead className="w-[85px] text-right py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs divide-y divide-border/40">
              {paginatedExpenses.map((item) => {
                const parsedDate = parseISO(item.date);
                const isConfirming = confirmDeleteId === item.id;
                const isDeleting = deletingId === item.id;

                return (
                  <TableRow
                    key={item.id}
                    onClick={() => onEditExpense(item)}
                    className="hover:bg-secondary/35 cursor-pointer transition-colors group"
                  >
                    {/* Date */}
                    <TableCell className="py-2 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {format(parsedDate, "dd MMM yyyy")}
                    </TableCell>

                    {/* Note / Merchant */}
                    <TableCell className="py-2 font-medium text-foreground max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{item.notes || item.category}</span>
                        {Number(item.amount) <= 200 && (
                          <span
                            title="Micro-transaction ≤ ₹200"
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 flex-shrink-0"
                          >
                            <Coffee className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748b" }}
                        />
                        <span className="text-muted-foreground text-[11px] truncate">{item.category}</span>
                      </div>
                    </TableCell>

                    {/* Payment */}
                    <TableCell className="py-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                        {getPaymentIcon(item.payment_method)}
                        {item.payment_method}
                      </span>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border whitespace-nowrap ${
                          EXPENSE_TYPE_LABELS[item.expense_type || "need"]?.badgeClass ||
                          "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {EXPENSE_TYPE_LABELS[item.expense_type || "need"]?.label || "Need"}
                      </span>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-2 text-right font-mono font-bold tabular-nums text-foreground">
                      ₹{Number(item.amount).toLocaleString()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {isConfirming ? (
                          <div className="flex items-center gap-1 animate-in fade-in duration-200">
                            <button
                              onClick={(e) => handleDeleteClick(e, item.id)}
                              disabled={isDeleting}
                              className="px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[10px] font-bold hover:bg-destructive/90 transition-colors shadow-xs flex items-center gap-0.5"
                              title="Click again to confirm delete"
                            >
                              <Check className="w-2.5 h-2.5" />
                              Del?
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditExpense(item)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="Edit expense"
                              aria-label="Edit expense"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, item.id)}
                              disabled={isDeleting}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete expense"
                              aria-label="Delete expense"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Comfortable Cards View (Grouped by Date) */
        <div className="space-y-3.5">
          {groupedExpenses.map(([dateKey, group]) => (
            <div key={dateKey} className="space-y-1.5">
              {/* Day Subtotal Header */}
              <div className="flex items-center justify-between px-2 text-[11px]">
                <span className="font-semibold text-foreground/85 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {group.label}
                </span>
                <span className="font-mono text-muted-foreground">
                  Day Total: <span className="text-foreground font-semibold">₹{group.total.toLocaleString()}</span>
                </span>
              </div>

              {/* Dense Items Card */}
              <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm divide-y divide-border/40 overflow-hidden shadow-xs">
                {group.items.map((item) => {
                  const isConfirming = confirmDeleteId === item.id;
                  const isDeleting = deletingId === item.id;
                  const categoryColor = CATEGORY_COLORS[item.category] || "#64748b";

                  return (
                    <div
                      key={item.id}
                      onClick={() => onEditExpense(item)}
                      className="py-2.5 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-secondary/30 cursor-pointer transition-colors group"
                    >
                      {/* Left: Category Icon Avatar + Note & Metadata */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Category Avatar Box */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${categoryColor}18`,
                            color: categoryColor,
                            border: `1px solid ${categoryColor}35`,
                          }}
                          title={item.category}
                        >
                          {getCategoryIcon(item.category)}
                        </div>

                        {/* Title & Metadata tags */}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                            <span className="truncate">{item.notes || item.category}</span>
                            {Number(item.amount) <= 200 && (
                              <span
                                title="Micro-transaction ≤ ₹200"
                                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 flex-shrink-0"
                              >
                                <Coffee className="w-2.5 h-2.5" />
                                ≤₹200
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                            <span className="text-foreground/80 font-medium">{item.category}</span>
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
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Inline Action Buttons */}
                      <div
                        className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-xs sm:text-sm font-bold text-foreground font-mono tabular-nums text-right">
                          ₹{Number(item.amount).toLocaleString()}
                        </div>

                        <div className="flex items-center gap-0.5">
                          {isConfirming ? (
                            <div className="flex items-center gap-1 animate-in fade-in duration-200">
                              <button
                                onClick={(e) => handleDeleteClick(e, item.id)}
                                disabled={isDeleting}
                                className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-[10px] font-bold hover:bg-destructive/90 transition-colors shadow-xs flex items-center gap-1"
                                title="Click again to confirm delete"
                              >
                                <Check className="w-3 h-3" />
                                Confirm?
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="p-1 rounded text-muted-foreground hover:text-foreground"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditExpense(item)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="Edit expense"
                                aria-label="Edit expense"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, item.id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                title="Delete expense"
                                aria-label="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Compact Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground order-2 sm:order-1">
            Showing <strong className="text-foreground">{startIndex + 1}–{endIndex}</strong> of{" "}
            {totalItems} items
          </span>

          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              disabled={validPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs gap-1 rounded-lg"
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
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-medium transition-colors ${
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
              className="h-7 px-2 text-xs gap-1 rounded-lg"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
