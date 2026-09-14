import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { sendSuccess } from "../utils/response.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from "../validators/transaction.validator.js";
import {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
  getTransactionSummaryService,
  getCategorySummaryService,
} from "../services/transaction.service.js";

export async function createTransactionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = createTransactionSchema.parse(req.body);
    const transaction = await createTransactionService(userId, input);
    sendSuccess(res, { transaction }, "Transaction created successfully", 201);
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const filters = transactionQuerySchema.parse(req.query);
    const result = await getTransactionsService(userId, filters);
    sendSuccess(res, result, "Transactions retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getTransactionSummaryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const summary = await getTransactionSummaryService(userId, startDate, endDate);
    sendSuccess(res, summary, "Transaction summary retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getCategorySummaryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const categories = await getCategorySummaryService(userId, startDate, endDate);
    sendSuccess(res, categories, "Category summary retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getTransactionByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const transactionId = req.params.id as string;
    const transaction = await getTransactionByIdService(userId, transactionId);
    sendSuccess(res, { transaction }, "Transaction retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateTransactionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const transactionId = req.params.id as string;
    const input = updateTransactionSchema.parse(req.body);
    const transaction = await updateTransactionService(
      userId,
      transactionId,
      input
    );
    sendSuccess(res, { transaction }, "Transaction updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteTransactionController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const transactionId = req.params.id as string;
    await deleteTransactionService(userId, transactionId);
    sendSuccess(res, null, "Transaction deleted successfully");
  } catch (error) {
    next(error);
  }
}
