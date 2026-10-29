// What a customer balance means for the business (positive = the customer pays us)
export const customerBalanceMeaning = (amount) =>
  amount > 0 ? "কাস্টমারের কাছ থেকে পাবো" : amount < 0 ? "কাস্টমারকে দিবো" : "কোনো পাওনা নেই";
