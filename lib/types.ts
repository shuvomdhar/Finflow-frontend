export type AccountStatus = "active" | "inactive" | "archive" | "failed";

export type User = {
  id: number;
  email: string;
  name: string | null;
  status: AccountStatus;
  statusUpdatedAt: string;
};

export type Income = {
  id: number;
  month: string;
  source: string;
  category: string;
  amount: number;
  note: string | null;
};

export type Expense = {
  id: number;
  spentOn: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: string;
  note: string | null;
};

export type CategoryTotal = {
  category: string;
  total: number;
};

export type MonthPoint = {
  month: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
};

export type Overview = {
  month: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
  series: MonthPoint[];
  expenseCategories: CategoryTotal[];
  incomeCategories: CategoryTotal[];
  recentExpenses: Expense[];
  recentIncomes: Income[];
};

export type ReportTotals = {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
};

export type ReportInsights = {
  largestExpense: { title: string; amount: number; date: string } | null;
  topMerchant: { title: string; count: number; total: number } | null;
  activeDays: number;
  weekendAverage: number;
  weekdayAverage: number;
  averagePerActiveDay: number;
};

export type Report = {
  year: number;
  month: string | null;
  totals: ReportTotals;
  yearTotals: {
    income: number;
    expense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
  };
  months: MonthPoint[];
  days: { day: number; label: string; total: number }[];
  categories: CategoryTotal[];
  incomeCategories: CategoryTotal[];
  insights: ReportInsights;
};

export type MeResponse = {
  user: User;
  stats: { incomeCount: number; expenseCount: number };
};
