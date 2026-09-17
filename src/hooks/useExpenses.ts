import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ExpenseItem, ExpenseStats, ExpenseCategory, CategoryBudgets, CategoryBudgetStatus } from "@/types/expenses";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval, parseISO, format, getDaysInMonth } from "date-fns";

const BUDGET_STORAGE_KEY = "karan_monthly_budget_v1";
const CATEGORY_BUDGETS_STORAGE_KEY = "karan_category_budgets_v1";
const DEFAULT_BUDGET = 25000;

export function useExpenses() {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
    return saved ? Number(saved) : DEFAULT_BUDGET;
  });
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgets>(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_BUDGETS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track Supabase Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch expenses and budget from Supabase only if authenticated
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      if (session?.user) {
        // Fetch expenses
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;
        setExpenses((data as ExpenseItem[]) || []);

        // Fetch monthly budget & category budgets from site_settings
        const { data: settingsData } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["monthly_budget", "category_budgets"]);

        if (settingsData && settingsData.length > 0) {
          settingsData.forEach((setting) => {
            if (setting.key === "monthly_budget" && setting.value) {
              const parsed = Number(setting.value);
              if (!isNaN(parsed) && parsed > 0) {
                setMonthlyBudget(parsed);
                localStorage.setItem(BUDGET_STORAGE_KEY, parsed.toString());
              }
            } else if (setting.key === "category_budgets" && setting.value) {
              try {
                const parsedCats = JSON.parse(setting.value);
                if (parsedCats && typeof parsedCats === "object") {
                  setCategoryBudgets(parsedCats);
                  localStorage.setItem(CATEGORY_BUDGETS_STORAGE_KEY, JSON.stringify(parsedCats));
                }
              } catch (e) {
                console.error("Failed to parse category_budgets:", e);
              }
            }
          });
        }
      } else {
        // Guests: No localstorage records, locked state
        setExpenses([]);
      }
    } catch (err) {
      console.error("Failed to load expenses:", err);
      toast({
        title: "Error loading expenses",
        description: err instanceof Error ? err.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchExpenses();
    }
  }, [authLoading, fetchExpenses]);

  // Update budget and sync to Supabase
  const updateMonthlyBudget = async (newBudget: number) => {
    setMonthlyBudget(newBudget);
    localStorage.setItem(BUDGET_STORAGE_KEY, newBudget.toString());

    if (session?.user) {
      try {
        const { error } = await supabase.from("site_settings").upsert({
          key: "monthly_budget",
          value: newBudget.toString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync budget to Supabase:", err);
      }
    }

    toast({
      title: "Budget updated",
      description: `Monthly budget set to ₹${newBudget.toLocaleString()} (synced to cloud)`,
    });
  };

  // Update category budgets and sync to Supabase
  const updateCategoryBudgets = async (newBudgets: CategoryBudgets) => {
    setCategoryBudgets(newBudgets);
    localStorage.setItem(CATEGORY_BUDGETS_STORAGE_KEY, JSON.stringify(newBudgets));

    if (session?.user) {
      try {
        const { error } = await supabase.from("site_settings").upsert({
          key: "category_budgets",
          value: JSON.stringify(newBudgets),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync category budgets to Supabase:", err);
      }
    }

    toast({
      title: "Category limits updated",
      description: "Your category spending caps have been saved and synced.",
    });
  };

  // Add Expense - requires authentication
  const addExpense = async (
    item: Omit<ExpenseItem, "id" | "user_id" | "created_at">
  ): Promise<boolean> => {
    if (!session?.user) {
      toast({
        title: "Login Required",
        description: "You must be logged in as admin to record expenses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const payload = {
        user_id: session.user.id,
        amount: item.amount,
        category: item.category,
        payment_method: item.payment_method,
        expense_type: item.expense_type || "need",
        notes: item.notes || "",
        date: item.date || new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      setExpenses((prev) => [data as ExpenseItem, ...prev]);

      toast({
        title: "Expense added",
        description: `₹${item.amount.toLocaleString()} for ${item.category}`,
      });
      return true;
    } catch (err) {
      console.error("Failed to add expense:", err);
      toast({
        title: "Failed to add expense",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return false;
    }
  };

  // Edit Expense - requires authentication
  const updateExpense = async (
    id: string,
    item: Partial<Omit<ExpenseItem, "id" | "user_id">>
  ): Promise<boolean> => {
    if (!session?.user) {
      toast({
        title: "Login Required",
        description: "You must be logged in as admin to update expenses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .update(item)
        .eq("id", id);

      if (error) throw error;

      const updated = expenses.map((exp) => (exp.id === id ? { ...exp, ...item } : exp));
      setExpenses(updated);

      toast({
        title: "Expense updated",
      });
      return true;
    } catch (err) {
      console.error("Failed to update expense:", err);
      toast({
        title: "Failed to update expense",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete Expense - requires authentication
  const deleteExpense = async (id: string): Promise<boolean> => {
    if (!session?.user) {
      toast({
        title: "Login Required",
        description: "You must be logged in as admin to delete expenses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const updated = expenses.filter((exp) => exp.id !== id);
      setExpenses(updated);

      toast({
        title: "Expense deleted",
      });
      return true;
    } catch (err) {
      console.error("Failed to delete expense:", err);
      toast({
        title: "Failed to delete expense",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return false;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (expenses.length === 0) {
      toast({ title: "No expenses to export" });
      return;
    }

    const headers = ["Date", "Category", "Type", "Amount (INR)", "Payment Method", "Notes"];
    const rows = expenses.map((e) => [
      format(parseISO(e.date), "yyyy-MM-dd"),
      `"${e.category}"`,
      `"${(e.expense_type || "need").toUpperCase()}"`,
      e.amount,
      `"${e.payment_method}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exported successfully",
      description: `Downloaded ${expenses.length} records as CSV`,
    });
  };

  // Compute summary stats & smart spending metrics
  const stats: ExpenseStats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    let todayTotal = 0;
    let todayCount = 0;
    let monthTotal = 0;
    let monthCount = 0;
    let needsTotal = 0;
    let wantsTotal = 0;
    let investmentTotal = 0;
    let microSpendTotal = 0;
    let microSpendCount = 0;
    const categoryTotals: Record<string, number> = {};
    const todayCategoryTotals: Record<string, number> = {};

    expenses.forEach((item) => {
      const itemDate = parseISO(item.date);
      const amount = Number(item.amount) || 0;
      const type = item.expense_type || "need";

      // Today
      if (isWithinInterval(itemDate, { start: todayStart, end: todayEnd })) {
        todayTotal += amount;
        todayCount += 1;
        todayCategoryTotals[item.category] = (todayCategoryTotals[item.category] || 0) + amount;
      }

      // This Month
      if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        monthTotal += amount;
        monthCount += 1;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amount;

        // Needs vs Wants vs Investment breakdown
        if (type === "want") {
          wantsTotal += amount;
        } else if (type === "investment") {
          investmentTotal += amount;
        } else {
          needsTotal += amount;
        }

        // Micro-spend leakage: transactions <= ₹200
        if (amount <= 200) {
          microSpendTotal += amount;
          microSpendCount += 1;
        }
      }
    });

    const dayOfMonth = now.getDate();
    const daysInCurrentMonth = getDaysInMonth(now);
    // Days remaining in this month, including today
    const daysRemaining = Math.max(1, daysInCurrentMonth - dayOfMonth + 1);
    const averageDaily = dayOfMonth > 0 ? Math.round(monthTotal / dayOfMonth) : 0;

    // Remaining total monthly budget
    const remainingBudget = Math.max(0, monthlyBudget - monthTotal);

    // Safe Daily Budget:
    // Amount available for today and rest of month divided by daysRemaining
    const availableForRestOfMonth = Math.max(0, monthlyBudget - (monthTotal - todayTotal));
    const safeDailyBudget = daysRemaining > 0 ? Math.round(availableForRestOfMonth / daysRemaining) : 0;

    let todayPaceStatus: "under" | "over" | "exact" = "exact";
    if (todayTotal > safeDailyBudget) {
      todayPaceStatus = "over";
    } else if (todayTotal < safeDailyBudget) {
      todayPaceStatus = "under";
    }
    const todayPaceDiff = Math.abs(todayTotal - safeDailyBudget);

    const needsPercentage = monthTotal > 0 ? Math.round((needsTotal / monthTotal) * 100) : 0;
    const wantsPercentage = monthTotal > 0 ? Math.round((wantsTotal / monthTotal) * 100) : 0;
    const investmentPercentage = monthTotal > 0 ? Math.round((investmentTotal / monthTotal) * 100) : 0;
    const microSpendPercentage = monthTotal > 0 ? Math.round((microSpendTotal / monthTotal) * 100) : 0;

    let topCategory: { category: ExpenseCategory; amount: number } | null = null;
    let maxAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topCategory = { category: cat as ExpenseCategory, amount: amt };
      }
    });

    const budgetPercentage = monthlyBudget > 0 ? Math.min(100, Math.round((monthTotal / monthlyBudget) * 100)) : 0;

    // Category micro-budgets evaluation
    const categoryBudgetStatuses: CategoryBudgetStatus[] = Object.entries(categoryBudgets)
      .filter(([_, cap]) => typeof cap === "number" && (cap as number) > 0)
      .map(([cat, cap]) => {
        const spent = categoryTotals[cat] || 0;
        const budget = cap as number;
        const percentage = Math.round((spent / budget) * 100);
        const remaining = Math.max(0, budget - spent);
        return {
          category: cat as ExpenseCategory,
          spent,
          budget,
          percentage,
          remaining,
          isOverBudget: spent > budget,
          isNearBudget: percentage >= 85 && percentage < 100,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const overBudgetCategories = categoryBudgetStatuses.filter((s) => s.isOverBudget);
    const nearBudgetCategories = categoryBudgetStatuses.filter((s) => s.isNearBudget);

    // Detect today's spending spike
    const hasSpikeToday =
      safeDailyBudget > 0 &&
      todayTotal >= safeDailyBudget * 1.5 &&
      todayTotal - safeDailyBudget >= 300;

    let todaySpikeReason: { category: ExpenseCategory; amount: number } | undefined;
    if (hasSpikeToday) {
      let maxTodayCat = "";
      let maxTodayAmt = 0;
      Object.entries(todayCategoryTotals).forEach(([cat, amt]) => {
        if (amt > maxTodayAmt) {
          maxTodayAmt = amt;
          maxTodayCat = cat;
        }
      });
      if (maxTodayCat) {
        todaySpikeReason = {
          category: maxTodayCat as ExpenseCategory,
          amount: maxTodayAmt,
        };
      }
    }

    return {
      todayTotal,
      todayCount,
      monthTotal,
      monthCount,
      averageDaily,
      monthlyBudget,
      budgetPercentage,
      topCategory,
      safeDailyBudget,
      todayPaceStatus,
      todayPaceDiff,
      daysRemaining,
      remainingBudget,
      needsTotal,
      wantsTotal,
      investmentTotal,
      needsPercentage,
      wantsPercentage,
      investmentPercentage,
      microSpendTotal,
      microSpendCount,
      microSpendPercentage,
      categoryBudgetStatuses,
      hasSpikeToday,
      todaySpikeReason,
      overBudgetCategories,
      nearBudgetCategories,
    };
  }, [expenses, monthlyBudget, categoryBudgets]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been logged out of the admin session.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Sign Out Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return {
    expenses,
    loading: authLoading || loading,
    stats,
    isCloudSynced: !!session?.user,
    userEmail: session?.user?.email,
    categoryBudgets,
    addExpense,
    updateExpense,
    deleteExpense,
    updateMonthlyBudget,
    updateCategoryBudgets,
    exportToCSV,
    signOut,
    refetch: fetchExpenses,
  };
}
