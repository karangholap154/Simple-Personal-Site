import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseItem } from "@/types/expenses";

import ExpenseSummaryCards from "@/components/expenses/ExpenseSummaryCards";
import ExpenseQuickAdd from "@/components/expenses/ExpenseQuickAdd";
import ExpenseCharts from "@/components/expenses/ExpenseCharts";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseEditModal from "@/components/expenses/ExpenseEditModal";
import BudgetSettingsModal from "@/components/expenses/BudgetSettingsModal";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Lock,
  ArrowRight,
  ShieldCheck,
  Wallet,
  BarChart3,
  ListOrdered,
  Sparkles,
  Zap,
  PieChart,
  Terminal,
} from "lucide-react";

const Expenses = () => {
  usePageMeta({
    title: "Daily Expense Tracker | Karan Gholap",
    description:
      "A fast, personal daily expense tracker with real-time analytics, category breakdowns, and secure cloud synchronization.",
    path: "/expenses",
  });

  const {
    expenses,
    loading,
    stats,
    isCloudSynced,
    userEmail,
    addExpense,
    updateExpense,
    deleteExpense,
    updateMonthlyBudget,
    exportToCSV,
  } = useExpenses();

  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col">
          <Navigation />

          <main className="flex-1 py-8 space-y-8">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Wallet className="w-7 h-7 text-primary" />
                    Daily Expense Tracker
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track micro-spends, analyze category cash flows, and manage daily budgets.
                </p>

                {/* Status Indicator */}
                <div className="mt-2.5 flex items-center gap-2">
                  {isCloudSynced ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Cloud Synced ({userEmail})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                      <Lock className="w-3 h-3 text-amber-400" />
                      Private Access Only
                    </span>
                  )}
                </div>
              </div>

              {/* Actions (when logged in) */}
              {isCloudSynced && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    disabled={expenses.length === 0}
                    className="text-xs h-8"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    Export CSV
                  </Button>
                </div>
              )}
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-44 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : isCloudSynced ? (
              /* Authenticated User Dashboard */
              <div className="space-y-8">
                {/* KPI Summary Cards */}
                <ExpenseSummaryCards
                  stats={stats}
                  onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                />

                {/* Quick Add Section */}
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Log Daily Expense
                  </h2>
                  <ExpenseQuickAdd onAddExpense={addExpense} />
                </div>

                {/* Main Tabs: Overview vs Analytics */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 sm:w-80">
                    <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
                      <ListOrdered className="w-3.5 h-3.5" />
                      Overview & History
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Visual Analytics
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Overview & History */}
                  <TabsContent value="overview" className="space-y-8">
                    <ExpenseCharts expenses={expenses} />

                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        Transaction History
                      </h3>
                      <ExpenseList
                        expenses={expenses}
                        onEditExpense={(item) => setEditingExpense(item)}
                        onDeleteExpense={deleteExpense}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab 2: Full Analytics */}
                  <TabsContent value="analytics" className="space-y-6">
                    <ExpenseCharts expenses={expenses} />
                    <div className="p-6 rounded-xl border border-border bg-card/50 text-xs text-muted-foreground space-y-2">
                      <h4 className="font-semibold text-foreground text-sm">About Visual Analytics</h4>
                      <p>
                        Charts update dynamically with every recorded transaction. The Donut Chart aggregates all category percentages, while the Daily Trend captures cash outflows over the last 14 days.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              /* Guest / Visitor Locked State */
              <div className="space-y-8 py-4">
                {/* Hero Authentication Card */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card/80 via-card/40 to-card/20 p-6 sm:p-10 backdrop-blur-md shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

                  <div className="max-w-xl mx-auto text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center shadow-inner">
                      <Lock className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Authentication Required
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        To add, edit, or view personal daily expenses, you must be logged in with the authorized administrator account.
                      </p>
                    </div>

                    {/* Notice Callout */}
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-muted-foreground text-left space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Something exciting is brewing!</span>
                      </div>
                      <p className="text-foreground/80 leading-normal">
                        We're currently designing an interactive public experience for this page. Stay tuned for upcoming updates!
                      </p>
                    </div>

                    {/* CTAs */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button asChild className="w-full sm:w-auto font-medium gap-2">
                        <Link to="/admin">
                          <ShieldCheck className="w-4 h-4" />
                          Log In as Admin
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full sm:w-auto font-medium">
                        <Link to="/projects">
                          Explore Projects
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Features Teaser / Preview */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                    What this tracker includes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Daily Cash Flow</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Log daily micro-spends with payment methods (UPI, Card, Cash), categories, and notes.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Visual Analytics</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Interactive donut category distribution and 14-day spending trend curves via Recharts.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Budget Pacing</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Monthly spending limits with automated progress gauges and calculated daily burn rate.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 w-fit">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">CLI Terminal</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Directly record or inspect expenses right from the portfolio CLI via <code className="text-primary font-mono text-[11px]">expense add</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          <Footer />
        </div>

        {/* Modals */}
        <ExpenseEditModal
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={updateExpense}
        />

        <BudgetSettingsModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          currentBudget={stats.monthlyBudget}
          onSaveBudget={updateMonthlyBudget}
        />
      </div>
    </PageTransition>
  );
};

export default Expenses;
