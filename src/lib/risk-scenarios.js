// Hypothetical, independent outcomes; each scenario starts with the same $1,000.
export const startingValue = 1000;
export const riskScenarios = [
  {
    id: 'start',
    label: 'Starting point',
    shortLabel: 'Start',
    change: '0%',
    title: 'Both investments start equal.',
    metricLabel: 'Nothing lost',
    description: '$1,000 in Company A, or $100 in each of ten companies.',
    returns: Array(10).fill(0),
    takeaway: 'Same starting amount. A different way to spread your money.',
  },
  {
    id: 'company',
    label: 'Company A falls',
    shortLabel: 'Company A falls',
    change: '−50%',
    title: 'Company A falls 50%.',
    metricLabel: 'Company A’s share value',
    description:
      'Company A loses half its value. The other nine companies stay flat.',
    returns: [-0.5, ...Array(9).fill(0)],
    takeaway:
      'One company loses half its value, but the ten-company basket loses only 5%.',
  },
  {
    id: 'bankruptcy',
    label: 'Company A goes bankrupt',
    shortLabel: 'A goes bankrupt',
    change: '−100%',
    title: 'Company A goes bankrupt.',
    metricLabel: 'Company A’s share value',
    description:
      'In this example, its shares become worthless. The other nine companies stay flat.',
    returns: [-1, ...Array(9).fill(0)],
    takeaway:
      'The single-company investment is wiped out. The basket loses its $100 in A and keeps the other $900.',
  },
  {
    id: 'market',
    label: 'The whole market falls',
    shortLabel: 'Market falls',
    change: '−20%',
    title: 'The whole market falls 20%.',
    metricLabel: 'Every company’s share value',
    description: 'All ten companies lose 20% at the same time.',
    returns: Array(10).fill(-0.2),
    takeaway:
      'Both lose $200. Diversification spreads company risk, but it cannot prevent a market-wide loss.',
  },
];

export function riskOutcome(returns) {
  const singleReturn = returns[0];
  const basketReturn =
    returns.reduce((sum, value) => sum + value, 0) / returns.length;
  return {
    single: { change: singleReturn, value: startingValue * (1 + singleReturn) },
    basket: { change: basketReturn, value: startingValue * (1 + basketReturn) },
  };
}

export const riskMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
export const riskPercent = (value) =>
  value === 0 ? '0%' : `−${Math.round(Math.abs(value) * 100)}%`;
