import { apiClient } from "@/services/apiClient";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskQueryFilters,
  GetTasksResponse,
} from "../types/task";

export async function getTasksApi(filters: TaskQueryFilters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.priority) queryParams.set("priority", filters.priority);
  if (filters.category) queryParams.set("category", filters.category);
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.dueDate) queryParams.set("dueDate", filters.dueDate);
  if (filters.page) queryParams.set("page", filters.page.toString());
  if (filters.limit) queryParams.set("limit", filters.limit.toString());
  if (filters.sortBy) queryParams.set("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.set("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/tasks${queryString ? `?${queryString}` : ""}`;

  return apiClient<GetTasksResponse>(endpoint, {
    method: "GET",
  });
}

export async function getTaskByIdApi(taskId: string) {
  return apiClient<{ task: Task }>(`/tasks/${taskId}`, {
    method: "GET",
  });
}

export async function createTaskApi(input: CreateTaskInput) {
  return apiClient<{ task: Task }>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTaskApi(taskId: string, input: UpdateTaskInput) {
  return apiClient<{ task: Task }>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateTaskStatusApi(taskId: string, status: TaskStatus) {
  return apiClient<{ task: Task }>(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteTaskApi(taskId: string) {
  return apiClient<null>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function addSubtaskApi(taskId: string, title: string) {
  return apiClient<{ task: Task }>(`/tasks/${taskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateSubtaskApi(
  taskId: string,
  subtaskId: string,
  data: { title?: string; completed?: boolean }
) {
  return apiClient<{ task: Task }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSubtaskApi(taskId: string, subtaskId: string) {
  return apiClient<{ task: Task }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "DELETE",
  });
}
