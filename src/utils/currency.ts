// Utility function to get currency symbol from localStorage
export const getCurrencySymbol = () => {
  return localStorage.getItem('VITE_CURRENCY_SYMBOL') || '$';
};

// Format amount with currency symbol
export const formatCurrency = (amount: string | number) => {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;
  const currencySymbol = getCurrencySymbol();

  // Multiply the amount by 84 if the symbol is ₹
  const adjustedAmount =
    currencySymbol === '₹' ? numericAmount * 84 : numericAmount;

  return `${currencySymbol}${Math.round(adjustedAmount)}`;
};
