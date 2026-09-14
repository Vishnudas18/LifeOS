import { Types, FilterQuery } from "mongoose";
import { Transaction, ITransactionDoc } from "../models/Transaction.js";
import {
  TransactionQueryFilters,
  TransactionSummaryData,
  CategorySummaryItem,
  TransactionType,
} from "../types/transaction.types.js";

export async function createTransactionRepository(
  userId: string,
  data: Partial<ITransactionDoc>
): Promise<ITransactionDoc> {
  return Transaction.create({
    ...data,
    userId: new Types.ObjectId(userId),
  });
}

export async function findTransactionByIdRepository(
  userId: string,
  transactionId: string
): Promise<ITransactionDoc | null> {
  if (!Types.ObjectId.isValid(transactionId)) {
    return null;
  }
  return Transaction.findOne({
    _id: transactionId,
    userId: new Types.ObjectId(userId),
  });
}

export async function findTransactionsRepository(
  userId: string,
  filters: TransactionQueryFilters
): Promise<{
  transactions: ITransactionDoc[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query: FilterQuery<ITransactionDoc> = {
    userId: new Types.ObjectId(userId),
  };

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      // Include the end of the day for endDate if it's an ISO date string
      const end = new Date(filters.endDate);
      if (!filters.endDate.includes("T")) {
        end.setHours(23, 59, 59, 999);
      }
      query.date.$lte = end;
    }
  }

  if (filters.search && filters.search.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [{ description: searchRegex }, { notes: searchRegex }];
  }

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
  const skip = (page - 1) * limit;

  const sortBy = filters.sortBy || "date";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  // Secondary tie-breaker sort
  if (sortBy !== "createdAt") {
    sortOptions.createdAt = -1;
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort(sortOptions).skip(skip).limit(limit),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function updateTransactionRepository(
  userId: string,
  transactionId: string,
  updateData: Partial<ITransactionDoc>
): Promise<ITransactionDoc | null> {
  if (!Types.ObjectId.isValid(transactionId)) {
    return null;
  }
  return Transaction.findOneAndUpdate(
    { _id: transactionId, userId: new Types.ObjectId(userId) },
    { $set: updateData },
    { new: true, runValidators: true }
  );
}

export async function deleteTransactionRepository(
  userId: string,
  transactionId: string
): Promise<ITransactionDoc | null> {
  if (!Types.ObjectId.isValid(transactionId)) {
    return null;
  }
  return Transaction.findOneAndDelete({
    _id: transactionId,
    userId: new Types.ObjectId(userId),
  });
}

export async function getTransactionSummaryRepository(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<TransactionSummaryData> {
  const matchStage: FilterQuery<ITransactionDoc> = {
    userId: new Types.ObjectId(userId),
  };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) {
      matchStage.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!endDate.includes("T")) {
        end.setHours(23, 59, 59, 999);
      }
      matchStage.date.$lte = end;
    }
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", TransactionType.INCOME] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0],
          },
        },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  if (!result || result.length === 0) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0,
    };
  }

  const { totalIncome, totalExpense, transactionCount } = result[0];
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount,
  };
}

export async function getCategorySummaryRepository(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<CategorySummaryItem[]> {
  const matchStage: FilterQuery<ITransactionDoc> = {
    userId: new Types.ObjectId(userId),
  };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) {
      matchStage.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!endDate.includes("T")) {
        end.setHours(23, 59, 59, 999);
      }
      matchStage.date.$lte = end;
    }
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { amount: -1 } },
  ]);

  return result.map((item) => ({
    category: item._id.category,
    type: item._id.type as TransactionType,
    amount: item.amount,
  }));
}
