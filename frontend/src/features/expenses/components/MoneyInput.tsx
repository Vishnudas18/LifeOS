import React from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | string;
  onChange: (value: number) => void;
  currencySymbol?: string;
  error?: string;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, currencySymbol = "₹", className, error, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "") {
        onChange(0);
        return;
      }
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0) {
        onChange(parsed);
      }
    };

    return (
      <div className="space-y-1">
        <div className="relative flex items-center rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <span className="flex h-9 items-center justify-center pl-3 pr-2 text-sm font-semibold text-muted-foreground select-none">
            {currencySymbol}
          </span>
          <input
            ref={ref}
            type="number"
            step="any"
            min="0"
            value={value === 0 ? "" : value}
            onChange={handleChange}
            placeholder="0.00"
            className={cn(
              "w-full h-9 bg-transparent py-1.5 pr-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
      </div>
    );
  }
);

MoneyInput.displayName = "MoneyInput";
