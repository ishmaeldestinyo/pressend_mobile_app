export const FormatAmount = (value: string) => {
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const GetAmountScale = (value: string) => {
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return '';
  if (num < 10) return 'Tenths';
  if (num < 100) return 'Tens';
  if (num < 1_000) return 'Hundreds';
  if (num < 1_000_000) return 'Thousands';
  if (num < 1_000_000_000) return 'Millions';
  return 'Billions+';
};
