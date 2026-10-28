// What a supplier balance means for the business (positive = we pay the supplier)
export const supplierBalanceMeaning = (amount) =>
  amount > 0 ? "সাপ্লায়ারকে দিবো" : amount < 0 ? "সাপ্লায়ারের কাছ থেকে পাবো" : "হিসাব সমান";
