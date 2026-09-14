import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Plus, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoneyInput } from "./MoneyInput";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  RECURRENCE_FREQUENCIES,
  formatCategoryName,
  formatPaymentMethodName,
  type Transaction,
  type CreateTransactionInput,
} from "../types/transaction";

const transactionFormSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.number().positive("Amount must be greater than zero"),
    currency: z.string(),
    category: z.string().min(1, "Category is required"),
    paymentMethod: z.enum(PAYMENT_METHODS),
    description: z
      .string()
      .min(1, "Description is required")
      .max(200, "Description cannot exceed 200 characters"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
    isRecurring: z.boolean().optional(),
    recurrenceFrequency: z.enum(RECURRENCE_FREQUENCIES).optional(),
    recurrenceInterval: z.number().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "EXPENSE") {
        return (EXPENSE_CATEGORIES as readonly string[]).includes(data.category);
      }
      if (data.type === "INCOME") {
        return (INCOME_CATEGORIES as readonly string[]).includes(data.category);
      }
      return true;
    },
    {
      message: "Please select a valid category for the transaction type",
      path: ["category"],
    }
  );

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  transactionToEdit?: Transaction | null;
  isLoading?: boolean;
}

export function TransactionDialog({
  isOpen,
  onClose,
  onSubmit,
  transactionToEdit,
  isLoading,
}: TransactionDialogProps) {
  const isEditing = !!transactionToEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      currency: "INR",
      category: "FOOD",
      paymentMethod: "UPI",
      description: "",
      date: new Date().toISOString().substring(0, 10),
      notes: "",
      isRecurring: false,
      recurrenceFrequency: "MONTHLY",
      recurrenceInterval: 1,
    },
  });

  const currentType = watch("type");
  const isRecurring = watch("isRecurring");

  // Dynamic category options based on selected Type
  const availableCategories =
    currentType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        currency: transactionToEdit.currency || "INR",
        category: transactionToEdit.category,
        paymentMethod: transactionToEdit.paymentMethod,
        description: transactionToEdit.description,
        date: transactionToEdit.date
          ? new Date(transactionToEdit.date).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        notes: transactionToEdit.notes || "",
        isRecurring: transactionToEdit.isRecurring || false,
        recurrenceFrequency: transactionToEdit.recurrence?.frequency || "MONTHLY",
        recurrenceInterval: transactionToEdit.recurrence?.interval || 1,
      });
    } else {
      reset({
        type: "EXPENSE",
        amount: 0,
        currency: "INR",
        category: "FOOD",
        paymentMethod: "UPI",
        description: "",
        date: new Date().toISOString().substring(0, 10),
        notes: "",
        isRecurring: false,
        recurrenceFrequency: "MONTHLY",
        recurrenceInterval: 1,
      });
    }
  }, [transactionToEdit, reset, isOpen]);

  // Handle switching transaction type to set appropriate default category
  const handleTypeChange = (newType: "INCOME" | "EXPENSE") => {
    setValue("type", newType);
    if (newType === "INCOME") {
      setValue("category", "SALARY");
    } else {
      setValue("category", "FOOD");
    }
  };

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TransactionFormData) => {
    const inputPayload: CreateTransactionInput = {
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      paymentMethod: data.paymentMethod,
      description: data.description,
      date: new Date(data.date).toISOString(),
      notes: data.notes || undefined,
      isRecurring: data.isRecurring,
      recurrence: data.isRecurring
        ? {
            frequency: data.recurrenceFrequency || "MONTHLY",
            interval: data.recurrenceInterval || 1,
          }
        : null,
    };

    await onSubmit(inputPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isEditing ? "Edit Transaction" : "New Transaction"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditing
                ? "Update financial entry details below."
                : "Log a new income or expense item."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <CardContent className="space-y-4 p-6 overflow-y-auto flex-1">
            {/* Type Selector (Tabs) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Transaction Type <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTypeChange("EXPENSE")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                    currentType === "EXPENSE"
                      ? "bg-background text-rose-600 dark:text-rose-400 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("INCOME")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                    currentType === "INCOME"
                      ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Income
                </button>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Amount <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.amount?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {errors.date && (
                  <p className="text-[11px] text-destructive">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <input
                {...register("description")}
                placeholder={
                  currentType === "EXPENSE"
                    ? "e.g. Swiggy dinner, Metro card recharge"
                    : "e.g. Monthly salary, Client invoice"
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.description && (
                <p className="text-[11px] text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category & Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("category")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategoryName(cat)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-[11px] text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Payment Method <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("paymentMethod")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {formatPaymentMethodName(method)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Notes (Optional)</label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Add receipt info, breakdown, or details..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            {/* Recurring Toggle */}
            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  {...register("isRecurring")}
                  className="h-4 w-4 rounded border-input cursor-pointer"
                />
                <label htmlFor="isRecurring" className="text-xs font-medium cursor-pointer">
                  Recurring Transaction
                </label>
              </div>

              {isRecurring && (
                <div className="pl-6 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                    <select
                      {...register("recurrenceFrequency")}
                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Interval</label>
                    <input
                      type="number"
                      min="1"
                      {...register("recurrenceInterval", { valueAsNumber: true })}
                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Save Entry
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
