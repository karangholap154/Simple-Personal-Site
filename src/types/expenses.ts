export type ExpenseCategory =
  | "Food & Dining"
  | "Transport & Travel"
  | "Tech & Hosting"
  | "Bills & Utilities"
  | "Shopping"
  | "Entertainment"
  | "Education & Books"
  | "Health & Fitness"
  | "Other";

export type PaymentMethod = "UPI" | "Credit Card" | "Debit Card" | "Cash" | "NetBanking";

export type ExpenseType = "need" | "want" | "investment";

export interface ExpenseItem {
  id: string;
  user_id?: string;
  amount: number;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  expense_type?: ExpenseType;
  notes: string;
  date: string; // ISO 8601 string
  created_at?: string;
}

export type CategoryBudgets = Partial<Record<ExpenseCategory, number>>;

export interface CategoryBudgetStatus {
  category: ExpenseCategory;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isNearBudget: boolean;
}

export interface ExpenseStats {
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  monthCount: number;
  averageDaily: number;
  monthlyBudget: number;
  budgetPercentage: number;
  topCategory: {
    category: ExpenseCategory;
    amount: number;
  } | null;
  // Smart Spending Insights
  safeDailyBudget: number;
  todayPaceStatus: "under" | "over" | "exact";
  todayPaceDiff: number;
  daysRemaining: number;
  remainingBudget: number;
  needsTotal: number;
  wantsTotal: number;
  investmentTotal: number;
  needsPercentage: number;
  wantsPercentage: number;
  investmentPercentage: number;
  microSpendTotal: number;
  microSpendCount: number;
  microSpendPercentage: number;
  // Category Micro-Budgets & Spike Alerts
  categoryBudgetStatuses: CategoryBudgetStatus[];
  hasSpikeToday: boolean;
  todaySpikeReason?: { category: ExpenseCategory; amount: number };
  overBudgetCategories: CategoryBudgetStatus[];
  nearBudgetCategories: CategoryBudgetStatus[];
}

export const EXPENSE_TYPE_LABELS: Record<
  ExpenseType,
  { label: string; description: string; badgeClass: string; activeClass: string }
> = {
  need: {
    label: "Need",
    description: "Essential (Groceries, rent, bills, transit)",
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    activeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30",
  },
  want: {
    label: "Want",
    description: "Discretionary (Dining out, entertainment, impulse shopping)",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30",
  },
  investment: {
    label: "Investment",
    description: "Growth (Courses, books, hosting, tech tools, gym)",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    activeClass: "bg-blue-500/20 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30",
  },
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "Food & Dining": "#f97316", // orange-500
  "Transport & Travel": "#3b82f6", // blue-500
  "Tech & Hosting": "#8b5cf6", // violet-500
  "Bills & Utilities": "#eab308", // yellow-500
  "Shopping": "#ec4899", // pink-500
  "Entertainment": "#a855f7", // purple-500
  "Education & Books": "#06b6d4", // cyan-500
  "Health & Fitness": "#10b981", // emerald-500
  "Other": "#64748b", // slate-500
};

