import data from '../data/card-drawdowns.json' with { type: 'json' };

/** @type {Record<string, any>} */
const records = data.records;
export const drawdownDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));

export function cardDrawdown(person) {
  const entry = records[person];
  if (!entry?.latest || !Number.isFinite(entry.latest.value))
    return {
      available: false,
      value: '—',
      period: '10Y ESTIMATE',
      frequencyLabel: 'Unavailable',
      description:
        entry?.reason ??
        'No comparable intra-year return history has been established.',
    };
  const latest = entry.latest;
  return {
    ...entry,
    available: true,
    value: `≈${latest.value < 0 ? '−' : ''}${Math.abs(latest.value).toFixed(1)}%`,
    period: `10Y · ${drawdownDate(latest.endDate)}`,
    frequencyLabel:
      entry.basis === 'market-price proxy'
        ? 'Daily price proxy'
        : entry.frequency === 'weekly'
          ? 'Weekly NAV'
          : 'Daily closes',
    description: `Estimated largest peak-to-trough decline from ${drawdownDate(latest.startDate)} to ${drawdownDate(latest.endDate)}, using ${entry.frequency} observations in USD. ${entry.note} Source: ${entry.sourceLabel}.`,
  };
}
