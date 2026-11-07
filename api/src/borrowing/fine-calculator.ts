const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_FINE_PER_DAY = 10;

export function calculateFine(
  dueDate: Date | string,
  returnedAt: Date | string,
  finePerDay = DEFAULT_FINE_PER_DAY,
): number {
  const dueDay = toUtcDay(dueDate);
  const returnedDay = toUtcDay(returnedAt);

  if (!Number.isFinite(finePerDay) || finePerDay < 0) {
    throw new RangeError('finePerDay must be a non-negative number.');
  }

  const daysLate = Math.max(0, Math.floor((returnedDay - dueDay) / MILLISECONDS_PER_DAY));
  return daysLate * finePerDay;
}

function toUtcDay(value: Date | string): number {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Dates must be valid.');
  }
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
