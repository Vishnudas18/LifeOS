import { apiClient } from "@/services/apiClient";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryFilters,
  GetTransactionsResponse,
  TransactionSummary,
  CategorySummaryItem,
} from "../types/transaction";

export async function getTransactionsApi(filters: TransactionQueryFilters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.type) queryParams.set("type", filters.type);
  if (filters.category) queryParams.set("category", filters.category);
  if (filters.paymentMethod) queryParams.set("paymentMethod", filters.paymentMethod);
  if (filters.startDate) queryParams.set("startDate", filters.startDate);
  if (filters.endDate) queryParams.set("endDate", filters.endDate);
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.page) queryParams.set("page", filters.page.toString());
  if (filters.limit) queryParams.set("limit", filters.limit.toString());
  if (filters.sortBy) queryParams.set("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.set("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

  return apiClient<GetTransactionsResponse>(endpoint, {
    method: "GET",
  });
}

export async function getTransactionByIdApi(transactionId: string) {
  return apiClient<{ transaction: Transaction }>(`/transactions/${transactionId}`, {
    method: "GET",
  });
}

export async function getTransactionSummaryApi(startDate?: string, endDate?: string) {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);

  const queryString = queryParams.toString();
  const endpoint = `/transactions/summary${queryString ? `?${queryString}` : ""}`;

  return apiClient<TransactionSummary>(endpoint, {
    method: "GET",
  });
}

export async function getCategorySummaryApi(startDate?: string, endDate?: string) {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);

  const queryString = queryParams.toString();
  const endpoint = `/transactions/categories/summary${queryString ? `?${queryString}` : ""}`;

  return apiClient<CategorySummaryItem[]>(endpoint, {
    method: "GET",
  });
}

export async function createTransactionApi(input: CreateTransactionInput) {
  return apiClient<{ transaction: Transaction }>("/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTransactionApi(
  transactionId: string,
  input: UpdateTransactionInput
) {
  return apiClient<{ transaction: Transaction }>(`/transactions/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTransactionApi(transactionId: string) {
  return apiClient<null>(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}
