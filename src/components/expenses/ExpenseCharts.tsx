import { useMemo } from "react";
import { ExpenseItem, CATEGORY_COLORS, ExpenseCategory } from "@/types/expenses";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, parseISO, subDays, isSameDay } from "date-fns";

interface Props {
  expenses: ExpenseItem[];
}

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  UPI: "#10b981",
  "Credit Card": "#3b82f6",
  "Debit Card": "#06b6d4",
  Cash: "#f59e0b",
  NetBanking: "#8b5cf6",
};

// Compact standalone Donut widget for sidebar use
export const CategoryDonutMini = ({ expenses }: { expenses: ExpenseItem[] }) => {
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name as ExpenseCategory] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (expenses.length === 0) return null;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">Category Share</h4>
        <span className="text-[10px] text-muted-foreground">{categoryData.length} categories</span>
      </div>

      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`mini-cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
                color: "hsl(var(--foreground))",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] border-t border-border/30">
        {categoryData.slice(0, 4).map((cat) => (
          <div key={cat.name} className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-muted-foreground truncate">{cat.name}:</span>
            <span className="font-semibold text-foreground font-mono">₹{cat.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExpenseCharts = ({ expenses }: Props) => {
  // Category breakdown data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name as ExpenseCategory] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Payment method data
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((item) => {
      map[item.payment_method] = (map[item.payment_method] || 0) + Number(item.amount);
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: PAYMENT_METHOD_COLORS[name] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Last 14 days daily trend data
  const trendData = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const targetDay = subDays(today, i);
      const dayTotal = expenses
        .filter((item) => isSameDay(parseISO(item.date), targetDay))
        .reduce((sum, item) => sum + Number(item.amount), 0);

      days.push({
        dateStr: format(targetDay, "d MMM"),
        amount: dayTotal,
      });
    }

    return days;
  }, [expenses]);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
      {/* 14-Day Daily Trend Bar Chart (Expanded) */}
      <div className="lg:col-span-8 p-4 sm:p-5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">
            Daily Spending Velocity
          </h3>
          <span className="text-[11px] text-muted-foreground font-mono">Last 14 Days</span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Daily outflow fluctuations and weekend burn spikes
        </p>

        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="dateStr"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={6}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <RechartsTooltip
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Donut */}
      <div className="lg:col-span-4 p-4 sm:p-5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">
            Category Breakdown
          </h3>
          <p className="text-[11px] text-muted-foreground mb-2">
            Where your funds are allocated
          </p>

          <div className="h-44 sm:h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-start mt-2 pt-2 border-t border-border/40 max-h-24 overflow-y-auto">
          {categoryData.slice(0, 5).map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-muted-foreground truncate max-w-[90px]">{cat.name}:</span>
              <span className="font-semibold text-foreground font-mono">₹{cat.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Split Card (Full-width row on bottom of charts) */}
      <div className="lg:col-span-12 p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-foreground">Payment Channel Distribution</h4>
          <span className="text-[10px] text-muted-foreground">UPI vs Card vs Cash</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {paymentData.map((p) => {
            const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
            const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
            return (
              <div key={p.name} className="p-2.5 rounded-lg border border-border/50 bg-secondary/20">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                </div>
                <div className="text-sm font-bold text-foreground font-mono">₹{p.value.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">{pct}% of outflow</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;
