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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Category Breakdown Donut */}
      <div className="lg:col-span-5 p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Category Distribution
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Where your money is allocated
        </p>

        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
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

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2 max-h-24 overflow-y-auto">
          {categoryData.slice(0, 6).map((cat) => (
            <div key={cat.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-muted-foreground truncate max-w-[110px]">{cat.name}:</span>
              <span className="font-semibold text-foreground">₹{cat.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 14-Day Daily Trend Bar Chart */}
      <div className="lg:col-span-7 p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">
            Daily Spending Trend
          </h3>
          <span className="text-[11px] text-muted-foreground">Last 14 Days</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Daily cash outflows over time
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="dateStr"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={8}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <RechartsTooltip
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Total Spent"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default ExpenseCharts;
