export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description?: string;
  date: string;
  ecoImpact?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  ecoRating: string;
  co2Reduction: number;
  totalTransactions: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  ecoMetrics: {
    totalCo2: number;
    rating: string;
    recommendations: string[];
  };
}

export const TRANSACTION_CATEGORIES = {
  income: [
    { value: "salary", label: "Зарплата" },
    { value: "freelance", label: "Фриланс" },
    { value: "business", label: "Бизнес" },
    { value: "investment", label: "Инвестиции" },
    { value: "other", label: "Другое" }
  ],
  expense: [
    { value: "food", label: "Еда" },
    { value: "transport", label: "Транспорт" },
    { value: "utilities", label: "Коммунальные" },
    { value: "shopping", label: "Покупки" },
    { value: "entertainment", label: "Развлечения" },
    { value: "healthcare", label: "Здоровье" },
    { value: "education", label: "Образование" },
    { value: "other", label: "Другое" }
  ]
};
