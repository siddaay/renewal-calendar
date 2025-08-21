// src/utils/dateHelpers.js

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const getDaysUntil = (dateString) => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isAgreementExpired = (agreement) => {
  if (!agreement.end_date) return false;
  const today = new Date();
  const endDate = new Date(agreement.end_date);
  return today > endDate;
};