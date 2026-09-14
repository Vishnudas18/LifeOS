import { z } from "zod";
import {
  TransactionType,
  ExpenseCategory,
  IncomeCategory,
  PaymentMethod,
  RecurrenceFrequency,
} from "../types/transaction.types.js";

const expenseCategories = Object.values(ExpenseCategory) as [string, ...string[]];
const incomeCategories = Object.values(IncomeCategory) as [string, ...string[]];
const allCategories = [...expenseCategories, ...incomeCategories] as [
  string,
  ...string[],
];

export const recurrenceSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().min(1).default(1),
});

export const createTransactionSchema = z
  .object({
    type: z.nativeEnum(TransactionType, {
      required_error: "Type is required (INCOME or EXPENSE)",
    }),
    amount: z.coerce
      .number({ required_error: "Amount is required" })
      .positive("Amount must be a positive number"),
    currency: z.string().default("INR"),
    category: z.enum(allCategories, {
      required_error: "Category is required",
    }),
    paymentMethod: z
      .nativeEnum(PaymentMethod)
      .default(PaymentMethod.OTHER),
    description: z
      .string({ required_error: "Description is required" })
      .trim()
      .min(1, "Description cannot be empty")
      .max(200, "Description cannot exceed 200 characters"),
    date: z.coerce.date().default(() => new Date()),
    notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional(),
    isRecurring: z.boolean().default(false),
    recurrence: recurrenceSchema.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === TransactionType.EXPENSE) {
        return (expenseCategories as string[]).includes(data.category);
      }
      if (data.type === TransactionType.INCOME) {
        return (incomeCategories as string[]).includes(data.category);
      }
      return true;
    },
    {
      message: "Category is invalid for the selected transaction type",
      path: ["category"],
    }
  )
  .refine(
    (data) => {
      if (data.isRecurring && !data.recurrence) {
        return false;
      }
      return true;
    },
    {
      message: "Recurrence options are required when isRecurring is true",
      path: ["recurrence"],
    }
  );

export const updateTransactionSchema = z
  .object({
    type: z.nativeEnum(TransactionType).optional(),
    amount: z.coerce.number().positive("Amount must be a positive number").optional(),
    currency: z.string().optional(),
    category: z.enum(allCategories).optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    description: z.string().trim().min(1).max(200).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).optional(),
    isRecurring: z.boolean().optional(),
    recurrence: recurrenceSchema.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type && data.category) {
        if (data.type === TransactionType.EXPENSE) {
          return (expenseCategories as string[]).includes(data.category);
        }
        if (data.type === TransactionType.INCOME) {
          return (incomeCategories as string[]).includes(data.category);
        }
      }
      return true;
    },
    {
      message: "Category is invalid for the selected transaction type",
      path: ["category"],
    }
  );

export const transactionQuerySchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  category: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["date", "amount", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryFiltersInput = z.infer<typeof transactionQuerySchema>;
