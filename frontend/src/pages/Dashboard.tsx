import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, CheckSquare, Wallet, Target, Timer } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">
          Welcome to your Life OS. Here is a snapshot of your daily progress.
        </p>
      </div>

      {/* Summary Stat Cards Placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 added today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">68% of monthly limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 target deadlines this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5 hrs</div>
            <p className="text-xs text-muted-foreground">Logged today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section Placeholder Card */}
      <Card className="min-h-[300px] flex items-center justify-center border-dashed">
        <div className="text-center p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Dashboard Module</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Main dashboard widgets, widgets customization, and activity feed will be displayed here.
          </p>
        </div>
      </Card>
    </div>
  );
}