import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalService } from "../services/goalService";
import type { GetGoalsResponse } from "../services/goalService";
import type {
  GoalQueryFilters,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  GoalDetailsResponse,
} from "../types/goal";

export function useGoals(filters: GoalQueryFilters = {}) {
  return useQuery<GetGoalsResponse, Error>({
    queryKey: ["goals", filters],
    queryFn: () => goalService.getGoals(filters),
  });
}

export function useGoal(goalId: string) {
  return useQuery<GoalDetailsResponse, Error>({
    queryKey: ["goal", goalId],
    queryFn: () => goalService.getGoalDetails(goalId),
    enabled: !!goalId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalService.createGoal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalService.updateGoal(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.id] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      input,
    }: {
      goalId: string;
      input: CreateMilestoneInput;
    }) => goalService.createMilestone(goalId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      milestoneId,
      input,
    }: {
      goalId: string;
      milestoneId: string;
      input: UpdateMilestoneInput;
    }) => goalService.updateMilestone(goalId, milestoneId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      milestoneId,
    }: {
      goalId: string;
      milestoneId: string;
    }) => goalService.deleteMilestone(goalId, milestoneId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useAssociateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      goalId,
      milestoneId,
    }: {
      taskId: string;
      goalId?: string | null;
      milestoneId?: string | null;
    }) => goalService.associateTask(taskId, goalId, milestoneId),
    onSuccess: (_, variables) => {
      if (variables.goalId) {
        queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      }
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
