import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/layout/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Expenses from "@/pages/Expenses";
import Calendar from "@/pages/Calendar";
import Goals from "@/pages/Goals";
import { GoalDetailPage } from "@/features/goals/pages/GoalDetailPage";
import Learning from "@/pages/Learning";
import Focus from "@/pages/Focus";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import SearchPage from "@/pages/SearchPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

function AppRoutes() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public-only routes (Redirect to / if logged in) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Application Routes (Redirect to /login if unauthenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:id" element={<GoalDetailPage />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;