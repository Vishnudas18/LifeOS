import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TaskQueryFilters,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
} from "../types/task";
import {
  getTasksApi,
  getTaskByIdApi,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
  addSubtaskApi,
  updateSubtaskApi,
  deleteSubtaskApi,
} from "../services/task.service";

export const TASKS_QUERY_KEY = ["tasks"];

export function useTasks(filters: TaskQueryFilters = {}) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await getTasksApi(filters);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch tasks");
      }
      return res.data;
    },
  });
}

export function useTaskDetails(taskId: string | null) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "detail", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await getTaskByIdApi(taskId);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch task details");
      }
      return res.data.task;
    },
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await createTaskApi(input);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create task");
      }
      return res.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => {
      const res = await updateTaskApi(taskId, input);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update task");
      }
      return res.data.task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TASKS_QUERY_KEY, "detail", variables.taskId],
      });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) => {
      const res = await updateTaskStatusApi(taskId, status);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update task status");
      }
      return res.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await deleteTaskApi(taskId);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete task");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useAddSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      title,
    }: {
      taskId: string;
      title: string;
    }) => {
      const res = await addSubtaskApi(taskId, title);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to add subtask");
      }
      return res.data.task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TASKS_QUERY_KEY, "detail", variables.taskId],
      });
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
      completed,
    }: {
      taskId: string;
      subtaskId: string;
      completed: boolean;
    }) => {
      const res = await updateSubtaskApi(taskId, subtaskId, { completed });
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update subtask");
      }
      return res.data.task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TASKS_QUERY_KEY, "detail", variables.taskId],
      });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      subtaskId,
    }: {
      taskId: string;
      subtaskId: string;
    }) => {
      const res = await deleteSubtaskApi(taskId, subtaskId);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to delete subtask");
      }
      return res.data.task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TASKS_QUERY_KEY, "detail", variables.taskId],
      });
    },
  });
}
