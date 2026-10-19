// A teaching example, not a forecast or a historical S&P 500 return series.
export const compoundExample = { initial: 10000, rate: 0.1, years: 30 };
export const compoundChartMax = 200000;
export const compoundBalance = (years) =>
  compoundExample.initial * (1 + compoundExample.rate) ** years;
export const uncompoundedBalance = (years) =>
  compoundExample.initial * (1 + compoundExample.rate * years);
export const compoundPoint = (years) => ({
  x: 44 + (years / compoundExample.years) * 480,
  y: 248 - (compoundBalance(years) / compoundChartMax) * 210,
});
export const compoundMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
