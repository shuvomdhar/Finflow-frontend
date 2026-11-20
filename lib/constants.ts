export const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary", color: "#059669" },
  { value: "freelance", label: "Freelance", color: "#4F46E5" },
  { value: "business", label: "Business", color: "#0EA5E9" },
  { value: "investment", label: "Investment", color: "#0F172A" },
  { value: "gift", label: "Gift", color: "#D97706" },
  { value: "other", label: "Other", color: "#64748B" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & dining", color: "#059669" },
  { value: "housing", label: "Housing", color: "#4F46E5" },
  { value: "transport", label: "Transport", color: "#0EA5E9" },
  { value: "shopping", label: "Shopping", color: "#DB2777" },
  { value: "health", label: "Health", color: "#DC2626" },
  { value: "entertainment", label: "Entertainment", color: "#9333EA" },
  { value: "education", label: "Education", color: "#CA8A04" },
  { value: "bills", label: "Bills & utilities", color: "#0891B2" },
  { value: "travel", label: "Travel", color: "#EA580C" },
  { value: "other", label: "Other", color: "#64748B" },
] as const;

export const PAYMENT_METHODS = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank transfer" },
  { value: "mobile", label: "Mobile wallet" },
  { value: "other", label: "Other" },
] as const;

const FALLBACK_COLOR = "#64748B";

export function incomeCategoryMeta(value: string) {
  return (
    INCOME_CATEGORIES.find((category) => category.value === value) ?? {
      value,
      label: value,
      color: FALLBACK_COLOR,
    }
  );
}

export function expenseCategoryMeta(value: string) {
  return (
    EXPENSE_CATEGORIES.find((category) => category.value === value) ?? {
      value,
      label: value,
      color: FALLBACK_COLOR,
    }
  );
}

export function paymentMethodLabel(value: string): string {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label ?? value;
}

export const BRAND = {
  emerald: "#059669",
  indigo: "#4F46E5",
  sky: "#0EA5E9",
  navy: "#0F172A",
};
