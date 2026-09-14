import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TransactionQueryFilters,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../types/transaction";
import {
  getTransactionsApi,
  getTransactionByIdApi,
  getTransactionSummaryApi,
  getCategorySummaryApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
} from "../services/transaction.service";

export const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function useTransactions(filters: TransactionQueryFilters = {}) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await getTransactionsApi(filters);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch transactions");
      }
      return res.data;
    },
  });
}

export function useTransactionSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "summary", startDate, endDate],
    queryFn: async () => {
      const res = await getTransactionSummaryApi(startDate, endDate);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch transaction summary");
      }
      return res.data;
    },
  });
}

export function useCategorySummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "categorySummary", startDate, endDate],
    queryFn: async () => {
      const res = await getCategorySummaryApi(startDate, endDate);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch category summary");
      }
      return res.data;
    },
  });
}

export function useTransactionDetails(transactionId: string | null) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, "detail", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const res = await getTransactionByIdApi(transactionId);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch transaction details");
      }
      return res.data.transaction;
    },
    enabled: !!transactionId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const res = await createTransactionApi(input);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create transaction");
      }
      return res.data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      input,
    }: {
      transactionId: string;
      input: UpdateTransactionInput;
    }) => {
      const res = await updateTransactionApi(transactionId, input);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update transaction");
      }
      return res.data.transaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...TRANSACTIONS_QUERY_KEY, "detail", variables.transactionId],
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await deleteTransactionApi(transactionId);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete transaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}
