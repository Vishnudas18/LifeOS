import { apiClient } from "@/services/apiClient";
import type {
  Goal,
  GoalDetailsResponse,
  GoalQueryFilters,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  Milestone,
  GoalSummary,
} from "../types/goal";
import type { Task } from "@/features/tasks/types/task";

export interface GetGoalsResponse {
  goals: Goal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: GoalSummary;
}

export const goalService = {
  async getGoals(filters: GoalQueryFilters = {}): Promise<GetGoalsResponse> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
    if (filters.category && filters.category !== "ALL") params.append("category", filters.category);
    if (filters.priority && filters.priority !== "ALL") params.append("priority", filters.priority);
    if (filters.search) params.append("search", filters.search);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.targetDate) params.append("targetDate", filters.targetDate);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/goals${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient<GetGoalsResponse>(endpoint);

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch goals");
    }

    return res.data;
  },

  async getGoalDetails(goalId: string): Promise<GoalDetailsResponse> {
    const res = await apiClient<GoalDetailsResponse>(`/goals/${goalId}`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch goal details");
    }
    return res.data;
  },

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    const res = await apiClient<{ goal: Goal }>("/goals", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to create goal");
    }

    return res.data.goal;
  },

  async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
    const res = await apiClient<{ goal: Goal }>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to update goal");
    }

    return res.data.goal;
  },

  async deleteGoal(id: string): Promise<void> {
    const res = await apiClient<null>(`/goals/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to delete goal");
    }
  },

  async getMilestones(goalId: string): Promise<Milestone[]> {
    const res = await apiClient<{ milestones: Milestone[] }>(`/goals/${goalId}/milestones`);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch milestones");
    }
    return res.data.milestones;
  },

  async createMilestone(goalId: string, input: CreateMilestoneInput): Promise<Milestone> {
    const res = await apiClient<{ milestone: Milestone }>(`/goals/${goalId}/milestones`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to create milestone");
    }

    return res.data.milestone;
  },

  async updateMilestone(
    goalId: string,
    milestoneId: string,
    input: UpdateMilestoneInput
  ): Promise<Milestone> {
    const res = await apiClient<{ milestone: Milestone }>(
      `/goals/${goalId}/milestones/${milestoneId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to update milestone");
    }

    return res.data.milestone;
  },

  async deleteMilestone(goalId: string, milestoneId: string): Promise<void> {
    const res = await apiClient<null>(`/goals/${goalId}/milestones/${milestoneId}`, {
      method: "DELETE",
    });

    if (!res.success) {
      throw new Error(res.message || "Failed to delete milestone");
    }
  },

  async associateTask(
    taskId: string,
    goalId?: string | null,
    milestoneId?: string | null
  ): Promise<Task> {
    const res = await apiClient<{ task: Task }>("/goals/associate-task", {
      method: "POST",
      body: JSON.stringify({ taskId, goalId, milestoneId }),
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to associate task");
    }

    return res.data.task;
  },
};
