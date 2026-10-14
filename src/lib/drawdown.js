// Observations must use the same total-return basis and be ordered by date.
// A close-to-close drawdown cannot capture losses between observations.
export function maximumDrawdown(observations) {
  if (!Array.isArray(observations) || observations.length < 2)
    throw new RangeError('At least two dated observations are required.');
  observations.forEach((point, index) => {
    if (
      !Number.isFinite(point.value) ||
      point.value < 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(point.date) ||
      (index && point.date <= observations[index - 1].date)
    )
      throw new RangeError(
        'Drawdown observations must be finite, nonnegative and chronological.',
      );
  });
  if (observations[0].value <= 0)
    throw new RangeError('The initial value must be positive.');
  let peak = observations[0];
  let value = 0;
  let peakDate = null;
  let troughIndex = null;
  let peakValue = null;
  observations.forEach((point, index) => {
    if (point.value >= peak.value) peak = point;
    const decline = (point.value / peak.value - 1) * 100;
    if (decline < value) {
      value = decline;
      peakDate = peak.date;
      peakValue = peak.value;
      troughIndex = index;
    }
  });
  const recovery =
    troughIndex === null
      ? null
      : observations
          .slice(troughIndex + 1)
          .find((point) => point.value >= peakValue * (1 - 1e-12));
  return {
    value,
    peakDate,
    troughDate: troughIndex === null ? null : observations[troughIndex].date,
    recoveryDate: recovery?.date ?? null,
    startDate: observations[0].date,
    endDate: observations.at(-1).date,
    observations: observations.length,
  };
}
