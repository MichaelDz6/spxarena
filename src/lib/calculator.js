export const defaultCalculator = {
  initial: 10000,
  monthly: 250,
  years: 20,
  months: 0,
  annualRate: 10,
};

export const defaultGoal = 100000;

export function calculateGoal(config) {
  const { target } = config;
  if (!Number.isFinite(target) || target < 1 || target > 100000000)
    throw new Error('Enter a target value from $1 to $100,000,000.');

  const withoutDeposits = calculateProjection({ ...config, monthly: 0 });
  const shortfall = target - withoutDeposits.value;
  if (shortfall > 0 && withoutDeposits.months === 0)
    throw new Error(
      'Choose at least 1 month to reach a goal above your starting investment.',
    );

  const monthlyRate = Math.expm1(Math.log1p(config.annualRate / 100) / 12);
  const depositGrowth =
    monthlyRate === 0
      ? withoutDeposits.months
      : Math.expm1(withoutDeposits.months * Math.log1p(monthlyRate)) /
        monthlyRate;
  // Round up so the displayed whole-dollar deposit funds the projected goal.
  const monthly = shortfall > 0 ? Math.ceil(shortfall / depositGrowth) : 0;
  if (monthly > 10000000)
    throw new Error(
      'This goal needs more than $10,000,000 per month. Try a longer time horizon or a lower target.',
    );
  return {
    ...calculateProjection({ ...config, monthly }),
    monthly,
    target,
    coveredByInitial: shortfall <= 0,
  };
}

export function calculateProjection(config) {
  const { initial, monthly, years, months, annualRate } = config;
  if (!Number.isFinite(initial) || initial < 0 || initial > 100000000)
    throw new Error('Enter a starting investment from $0 to $100,000,000.');
  if (!Number.isFinite(monthly) || monthly < 0 || monthly > 10000000)
    throw new Error('Enter a monthly contribution from $0 to $10,000,000.');
  if (!Number.isInteger(years) || years < 0 || years > 50)
    throw new Error('Enter a whole number of years from 0 to 50.');
  if (!Number.isInteger(months) || months < 0 || months > 11)
    throw new Error('Enter a whole number of additional months from 0 to 11.');
  if (!Number.isFinite(annualRate) || annualRate < -50 || annualRate > 50)
    throw new Error('Enter an average annual return from −50% to 50%.');

  const duration = years * 12 + months;
  // An effective monthly rate preserves the selected annual compound return.
  const monthlyRate = Math.expm1(Math.log1p(annualRate / 100) / 12);
  let value = initial;
  const points = [{ month: 0, value, invested: initial }];
  for (let month = 1; month <= duration; month++) {
    // Each contribution arrives after that month's growth.
    value = value * (1 + monthlyRate) + monthly;
    points.push({ month, value, invested: initial + monthly * month });
  }
  const invested = initial + monthly * duration;
  if (annualRate === 0) value = invested;
  return { value, invested, gain: value - invested, months: duration, points };
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export function formatDuration(months) {
  if (months === 0) return 'Today';
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return [
    years ? `${years} ${years === 1 ? 'year' : 'years'}` : '',
    remainder ? `${remainder} ${remainder === 1 ? 'month' : 'months'}` : '',
  ]
    .filter(Boolean)
    .join(', ');
}
