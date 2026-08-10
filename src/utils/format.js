export const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-NG').format(number);
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive',
    'in-stock': 'In Stock',
    'out-of-stock': 'Out of Stock',
  };
  return statusMap[status] || status;
};