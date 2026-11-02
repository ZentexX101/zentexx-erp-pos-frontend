import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, fetchExpensesData } from "../providers/apiProviders/expenseApiProvider";
import { branchStorage } from "../services/branchStorage";
import { STOCK_KEY } from "./useStockApi";

const EXPENSE_KEY = "expenses";

// Expenses belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of expenses — params: { search, type, category, from, to, page, limit }
export const useExpensesData = (params) => {
  return useQuery({
    queryKey: [EXPENSE_KEY, branchKey(), "list", params],
    queryFn: () => fetchExpensesData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ An expense changes payment method balances (general) or stock (product)
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createExpense(data),
    onSuccess: () => [EXPENSE_KEY, STOCK_KEY, "paymentMethods"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
