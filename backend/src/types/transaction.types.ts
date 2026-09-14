import { Types } from "mongoose";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum ExpenseCategory {
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  SHOPPING = "SHOPPING",
  ENTERTAINMENT = "ENTERTAINMENT",
  BILLS = "BILLS",
  HEALTH = "HEALTH",
  EDUCATION = "EDUCATION",
  TRAVEL = "TRAVEL",
  SUBSCRIPTIONS = "SUBSCRIPTIONS",
  OTHER = "OTHER",
}

export enum IncomeCategory {
  SALARY = "SALARY",
  FREELANCE = "FREELANCE",
  BUSINESS = "BUSINESS",
  INVESTMENT = "INVESTMENT",
  OTHER = "OTHER",
}

export enum PaymentMethod {
  CASH = "CASH",
  UPI = "UPI",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  OTHER = "OTHER",
}

export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface IRecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number;
}

export interface ITransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number; // Stored in smallest currency unit (e.g. paise for INR)
  currency: string;
  category: string;
  paymentMethod: PaymentMethod;
  description: string;
  date: Date;
  notes?: string;
  isRecurring: boolean;
  recurrence?: IRecurrenceConfig | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionSummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummaryItem {
  category: string;
  amount: number;
  type?: TransactionType;
}

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
