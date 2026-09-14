import { useState, useMemo } from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useTransactions,
  useTransactionSummary,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/features/expenses/hooks/useTransactions";
import { SummaryCards } from "@/features/expenses/components/SummaryCards";
import {
  FilterBar,
  type DateRangePreset,
} from "@/features/expenses/components/FilterBar";
import { TransactionList } from "@/features/expenses/components/TransactionList";
import { TransactionDialog } from "@/features/expenses/components/TransactionDialog";
import { DeleteConfirmationDialog } from "@/features/expenses/components/DeleteConfirmationDialog";
import type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
} from "@/features/expenses/types/transaction";

export default function Expenses() {
  // State for Filters
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [datePreset, setDatePreset] = useState<DateRangePreset>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Modal Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Calculate Date Filters based on Preset selection
  const computedDateFilters = useMemo(() => {
    if (datePreset === "CUSTOM") {
      return { startDate, endDate };
    }

    const now = new Date();
    if (datePreset === "TODAY") {
      const todayStr = now.toISOString().substring(0, 10);
      return { startDate: todayStr, endDate: todayStr };
    }

    if (datePreset === "THIS_WEEK") {
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      startOfWeek.setDate(diff);
      return {
        startDate: startOfWeek.toISOString().substring(0, 10),
        endDate: now.toISOString().substring(0, 10),
      };
    }

    if (datePreset === "THIS_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: firstDay.toISOString().substring(0, 10),
        endDate: now.toISOString().substring(0, 10),
      };
    }

    if (datePreset === "LAST_MONTH") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: firstDayLastMonth.toISOString().substring(0, 10),
        endDate: lastDayLastMonth.toISOString().substring(0, 10),
      };
    }

    return { startDate: undefined, endDate: undefined };
  }, [datePreset, startDate, endDate]);

  // Query Parameters
  const queryFilters = useMemo(
    () => ({
      type: typeFilter === "ALL" ? undefined : typeFilter,
      category: categoryFilter || undefined,
      paymentMethod: paymentMethodFilter ? (paymentMethodFilter as any) : undefined,
      startDate: computedDateFilters.startDate,
      endDate: computedDateFilters.endDate,
      search: searchQuery || undefined,
      page,
      limit: 15,
    }),
    [
      typeFilter,
      categoryFilter,
      paymentMethodFilter,
      computedDateFilters,
      searchQuery,
      page,
    ]
  );

  // TanStack Query hooks
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions(queryFilters);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useTransactionSummary(computedDateFilters.startDate, computedDateFilters.endDate);

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Reset Filters Handler
  const handleResetFilters = () => {
    setTypeFilter("ALL");
    setCategoryFilter("");
    setPaymentMethodFilter("");
    setSearchQuery("");
    setDatePreset("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setTransactionToEdit(null);
    setIsDialogOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (t: Transaction) => {
    setTransactionToEdit(t);
    setIsDialogOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (t: Transaction) => {
    setTransactionToDelete(t);
    setIsDeleteOpen(true);
  };

  // Submit Handler for Create / Edit
  const handleSubmitTransaction = async (input: CreateTransactionInput) => {
    if (transactionToEdit) {
      await updateMutation.mutateAsync({
        transactionId: transactionToEdit._id,
        input,
      });
    } else {
      await createMutation.mutateAsync(input);
    }
    refetchSummary();
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteMutation.mutateAsync(transactionToDelete._id);
      setIsDeleteOpen(false);
      setTransactionToDelete(null);
      refetchSummary();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-primary" />
            Expenses & Personal Finance
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor income, log spending, manage categories, and review financial health.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <SummaryCards summary={summaryData} isLoading={isSummaryLoading} />

      {/* Filter Toolbar */}
      <FilterBar
        typeFilter={typeFilter}
        onTypeChange={(t) => {
          setTypeFilter(t);
          setPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(c) => {
          setCategoryFilter(c);
          setPage(1);
        }}
        paymentMethodFilter={paymentMethodFilter}
        onPaymentMethodChange={(m) => {
          setPaymentMethodFilter(m);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(s) => {
          setSearchQuery(s);
          setPage(1);
        }}
        datePreset={datePreset}
        onDatePresetChange={(p) => {
          setDatePreset(p);
          setPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(d) => {
          setStartDate(d);
          setPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(d) => {
          setEndDate(d);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={transactionsData?.transactions}
        isLoading={isTransactionsLoading}
        isError={isTransactionsError}
        error={transactionsError as Error}
        page={page}
        totalPages={transactionsData?.pagination.totalPages || 1}
        totalCount={transactionsData?.pagination.total || 0}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={handleOpenCreate}
        onRetry={() => {
          refetchTransactions();
          refetchSummary();
        }}
      />

      {/* Create / Edit Dialog */}
      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitTransaction}
        transactionToEdit={transactionToEdit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        transaction={transactionToDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
