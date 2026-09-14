import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getTransactionsController,
  createTransactionController,
  getTransactionSummaryController,
  getCategorySummaryController,
  getTransactionByIdController,
  updateTransactionController,
  deleteTransactionController,
} from "../controllers/transaction.controller.js";

const transactionRouter = Router();

// Protect all transaction endpoints with auth middleware
transactionRouter.use(authenticate);

transactionRouter.get("/", getTransactionsController);
transactionRouter.post("/", createTransactionController);

// Summary endpoints (Must be declared before parameterized /:id route)
transactionRouter.get("/summary", getTransactionSummaryController);
transactionRouter.get("/categories/summary", getCategorySummaryController);

transactionRouter.get("/:id", getTransactionByIdController);
transactionRouter.patch("/:id", updateTransactionController);
transactionRouter.delete("/:id", deleteTransactionController);

export default transactionRouter;
