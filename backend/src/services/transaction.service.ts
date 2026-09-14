import {
  createTransactionRepository,
  findTransactionByIdRepository,
  findTransactionsRepository,
  updateTransactionRepository,
  deleteTransactionRepository,
  getTransactionSummaryRepository,
  getCategorySummaryRepository,
} from "../repositories/transaction.repository.js";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryFiltersInput,
} from "../validators/transaction.validator.js";
import { ITransactionDoc } from "../models/Transaction.js";

export class TransactionError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "TransactionError";
  }
}

// Convert decimal amount (e.g., 100.50) to integer subunit (10050 paise)
function toSubunit(amount: number): number {
  return Math.round(amount * 100);
}

// Convert integer subunit (10050 paise) to standard currency decimal (100.5)
function toStandardUnit(amountInSubunits: number): number {
  return amountInSubunits / 100;
}

function formatTransactionResponse(doc: ITransactionDoc) {
  const obj = doc.toJSON();
  return {
    ...obj,
    amount: toStandardUnit(doc.amount),
  };
}

export async function createTransactionService(
  userId: string,
  input: CreateTransactionInput
) {
  const amountSubunit = toSubunit(input.amount);
  const newTransaction = await createTransactionRepository(userId, {
    ...input,
    amount: amountSubunit,
  });
  return formatTransactionResponse(newTransaction);
}

export async function getTransactionsService(
  userId: string,
  filters: TransactionQueryFiltersInput
) {
  const result = await findTransactionsRepository(userId, filters);
  const formattedTransactions = result.transactions.map((t) =>
    formatTransactionResponse(t)
  );

  return {
    transactions: formattedTransactions,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
}

export async function getTransactionByIdService(
  userId: string,
  transactionId: string
) {
  const transaction = await findTransactionByIdRepository(userId, transactionId);
  if (!transaction) {
    throw new TransactionError("Transaction not found", 404);
  }
  return formatTransactionResponse(transaction);
}

export async function updateTransactionService(
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
) {
  const existing = await findTransactionByIdRepository(userId, transactionId);
  if (!existing) {
    throw new TransactionError("Transaction not found", 404);
  }

  const updateData: Partial<ITransactionDoc> = { ...input } as Partial<ITransactionDoc>;
  if (input.amount !== undefined) {
    updateData.amount = toSubunit(input.amount);
  }

  const updated = await updateTransactionRepository(
    userId,
    transactionId,
    updateData
  );

  if (!updated) {
    throw new TransactionError("Failed to update transaction", 500);
  }

  return formatTransactionResponse(updated);
}

export async function deleteTransactionService(
  userId: string,
  transactionId: string
) {
  const existing = await findTransactionByIdRepository(userId, transactionId);
  if (!existing) {
    throw new TransactionError("Transaction not found", 404);
  }
  await deleteTransactionRepository(userId, transactionId);
  return { id: transactionId };
}

export async function getTransactionSummaryService(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const summary = await getTransactionSummaryRepository(
    userId,
    startDate,
    endDate
  );
  return {
    totalIncome: toStandardUnit(summary.totalIncome),
    totalExpense: toStandardUnit(summary.totalExpense),
    balance: toStandardUnit(summary.balance),
    transactionCount: summary.transactionCount,
  };
}

export async function getCategorySummaryService(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const categories = await getCategorySummaryRepository(
    userId,
    startDate,
    endDate
  );
  return categories.map((c) => ({
    category: c.category,
    type: c.type,
    amount: toStandardUnit(c.amount),
  }));
}
