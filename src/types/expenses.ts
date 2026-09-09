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

export interface ExpenseItem {
  id: string;
  user_id?: string;
  amount: number;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  notes: string;
  date: string; // ISO 8601 string
  created_at?: string;
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
}

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
