import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ExpenseItem, ExpenseStats, ExpenseCategory } from "@/types/expenses";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from "date-fns";

const BUDGET_STORAGE_KEY = "karan_monthly_budget_v1";
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

        // Fetch monthly budget from site_settings
        const { data: budgetData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "monthly_budget")
          .maybeSingle();

        if (budgetData?.value) {
          const parsed = Number(budgetData.value);
          if (!isNaN(parsed) && parsed > 0) {
            setMonthlyBudget(parsed);
            localStorage.setItem(BUDGET_STORAGE_KEY, parsed.toString());
          }
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

    const headers = ["Date", "Category", "Amount (INR)", "Payment Method", "Notes"];
    const rows = expenses.map((e) => [
      format(parseISO(e.date), "yyyy-MM-dd"),
      `"${e.category}"`,
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

  // Compute summary stats
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
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((item) => {
      const itemDate = parseISO(item.date);
      const amount = Number(item.amount) || 0;

      // Today
      if (isWithinInterval(itemDate, { start: todayStart, end: todayEnd })) {
        todayTotal += amount;
        todayCount += 1;
      }

      // This Month
      if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
        monthTotal += amount;
        monthCount += 1;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amount;
      }
    });

    const dayOfMonth = now.getDate();
    const averageDaily = dayOfMonth > 0 ? Math.round(monthTotal / dayOfMonth) : 0;

    let topCategory: { category: ExpenseCategory; amount: number } | null = null;
    let maxAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topCategory = { category: cat as ExpenseCategory, amount: amt };
      }
    });

    const budgetPercentage = monthlyBudget > 0 ? Math.min(100, Math.round((monthTotal / monthlyBudget) * 100)) : 0;

    return {
      todayTotal,
      todayCount,
      monthTotal,
      monthCount,
      averageDaily,
      monthlyBudget,
      budgetPercentage,
      topCategory,
    };
  }, [expenses, monthlyBudget]);

  return {
    expenses,
    loading: authLoading || loading,
    stats,
    isCloudSynced: !!session?.user,
    userEmail: session?.user?.email,
    addExpense,
    updateExpense,
    deleteExpense,
    updateMonthlyBudget,
    exportToCSV,
    refetch: fetchExpenses,
  };
}
