const decimalAmount = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
const ungroup = (value) => value.trim().replaceAll(',', '');

export function parseAmount(value) {
  const raw = ungroup(value);
  return decimalAmount.test(raw) ? Number(raw) : NaN;
}

export function formatAmountInput(value) {
  const raw = ungroup(value);
  if (!decimalAmount.test(raw)) return value;
  const [integer, fraction] = raw.split('.');
  const sign = integer.startsWith('-') ? '-' : '';
  const digits = integer.replace('-', '').replace(/^0+(?=\d)/, '') || '0';
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + grouped + (fraction === undefined ? '' : `.${fraction}`);
}

export const startingInvestmentStep = (value) => (value < 10000 ? 100 : 1000);

export function stepStartingInvestment(value, direction) {
  return Math.max(
    0,
    Math.min(100000000, value + direction * startingInvestmentStep(value)),
  );
}

export const monthlyContributionStep = (value) =>
  value < 1000 ? 50 : value < 10000 ? 100 : 1000;

export function stepMonthlyContribution(value, direction) {
  return Math.max(
    0,
    Math.min(10000000, value + direction * monthlyContributionStep(value)),
  );
}
