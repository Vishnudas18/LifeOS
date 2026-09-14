import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FinancialAnalytics } from "../types/analytics";
import { DollarSign, PieChart } from "lucide-react";

interface FinancialChartsProps {
  financial: FinancialAnalytics | undefined;
  isLoading: boolean;
}

const CATEGORY_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  financial,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/60"><Skeleton className="h-64 w-full" /></Card>
        <Card className="p-6 border border-border/60"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  const data = financial || {
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    expenseByCategory: [],
    incomeByCategory: [],
    expenseByPaymentMethod: [],
    dailyTrend: [],
  };

  const categories = data.expenseByCategory || [];
  const daily = data.dailyTrend || [];

  // SVG Bar chart dimensions
  const width = 500;
  const height = 220;
  const padding = 35;
  const maxAmount = Math.max(1, ...daily.map((d) => Math.max(d.income, d.expenses)));

  // SVG Donut Chart calculations
  const totalExpenseVal = categories.reduce((sum, c) => sum + c.amount, 0);
  const size = 180;
  const center = size / 2;
  const strokeWidth = 24;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cash Flow Grouped Bar Chart */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <CardTitle className="text-base font-bold">Income vs Expenses</CardTitle>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />Income</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" />Expense</span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {daily.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
              No transactions in this date range.
            </div>
          ) : (
            <div className="relative w-full h-[220px]">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {[0, 0.5, 1].map((r) => {
                  const y = height - padding - r * (height - padding * 2);
                  return (
                    <line key={r} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-muted/40" strokeDasharray="3 3" />
                  );
                })}

                {daily.map((d, i) => {
                  const groupWidth = (width - padding * 2) / daily.length;
                  const barWidth = Math.max(3, groupWidth * 0.35);
                  const xBase = padding + i * groupWidth + groupWidth * 0.1;

                  const hInc = (d.income / maxAmount) * (height - padding * 2);
                  const hExp = (d.expenses / maxAmount) * (height - padding * 2);

                  return (
                    <g key={d.date}>
                      {/* Income Bar */}
                      <rect
                        x={xBase}
                        y={height - padding - hInc}
                        width={barWidth}
                        height={Math.max(0, hInc)}
                        className="fill-emerald-500 rx-1"
                        rx="2"
                      />
                      {/* Expense Bar */}
                      <rect
                        x={xBase + barWidth + 2}
                        y={height - padding - hExp}
                        width={barWidth}
                        height={Math.max(0, hExp)}
                        className="fill-rose-500 rx-1"
                        rx="2"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense by Category (Donut Chart & Legend) */}
      <Card className="border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base font-bold">Expenses by Category</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Breakdown</span>
        </CardHeader>

        <CardContent className="p-6">
          {categories.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
              No expense records in this range.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Donut SVG */}
              <div className="relative flex items-center justify-center w-[180px] h-[180px]">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
                  {categories.map((cat, i) => {
                    const strokeDasharray = `${(cat.amount / totalExpenseVal) * circumference} ${circumference}`;
                    const strokeDashoffset = -currentAngle;
                    currentAngle += (cat.amount / totalExpenseVal) * circumference;
                    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];

                    return (
                      <circle
                        key={cat.category}
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        fill="transparent"
                        className="transition-all duration-300 hover:opacity-90"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Total</span>
                  <span className="text-base font-black text-foreground">₹{totalExpenseVal.toLocaleString()}</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 w-full max-w-[200px]">
                {categories.slice(0, 5).map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="font-semibold truncate">{cat.category}</span>
                    </div>
                    <span className="font-bold text-foreground">₹{cat.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
