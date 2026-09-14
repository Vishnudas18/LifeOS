import { Schema, model, Document, Types } from "mongoose";
import {
  TransactionType,
  PaymentMethod,
  RecurrenceFrequency,
  IRecurrenceConfig,
  ExpenseCategory,
  IncomeCategory,
} from "../types/transaction.types.js";

export interface ITransactionDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number; // Stored in smallest currency unit (paise)
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

const recurrenceSchema = new Schema<IRecurrenceConfig>(
  {
    frequency: {
      type: String,
      enum: Object.values(RecurrenceFrequency),
      required: true,
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const allCategories = [
  ...Object.values(ExpenseCategory),
  ...Object.values(IncomeCategory),
];

const transactionSchema = new Schema<ITransactionDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, "Transaction type is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: allCategories,
      trim: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.OTHER,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: recurrenceSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes based on query patterns
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

// Text index for search functionality
transactionSchema.index({
  description: "text",
  notes: "text",
});

export const Transaction = model<ITransactionDoc>("Transaction", transactionSchema);
