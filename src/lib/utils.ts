import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(
  amount: number,
  options?: { includeSymbol?: boolean; maximumFractionDigits?: number }
): string {
  const { includeSymbol = true, maximumFractionDigits = 0 } = options ?? {};
  const formatted = new Intl.NumberFormat("en-IN", {
    style: includeSymbol ? "currency" : "decimal",
    currency: "INR",
    maximumFractionDigits,
  }).format(amount);
  return formatted;
}
