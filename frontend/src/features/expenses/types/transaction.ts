export type TransactionType = "INCOME" | "EXPENSE";

export const EXPENSE_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "SHOPPING",
  "ENTERTAINMENT",
  "BILLS",
  "HEALTH",
  "EDUCATION",
  "TRAVEL",
  "SUBSCRIPTIONS",
  "OTHER",
] as const;

export const INCOME_CATEGORIES = [
  "SALARY",
  "FREELANCE",
  "BUSINESS",
  "INVESTMENT",
  "OTHER",
] as const;

export const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export const RECURRENCE_FREQUENCIES = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number; // Decimal format (e.g. 100.5)
  currency: string;
  category: string;
  paymentMethod: PaymentMethod;
  description: string;
  date: string;
  notes?: string;
  isRecurring: boolean;
  recurrence?: RecurrenceConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  currency?: string;
  category: string;
  paymentMethod: PaymentMethod;
  description: string;
  date?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrence?: RecurrenceConfig | null;
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export interface TransactionQueryFilters {
  type?: TransactionType;
  category?: string;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummaryItem {
  category: string;
  type: TransactionType;
  amount: number;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatCategoryName(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatPaymentMethodName(method: PaymentMethod): string {
  switch (method) {
    case "CREDIT_CARD":
      return "Credit Card";
    case "DEBIT_CARD":
      return "Debit Card";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "UPI":
      return "UPI";
    case "CASH":
      return "Cash";
    default:
      return "Other";
  }
}
