export function getNightTimeWindow({ testMode = false } = {}) {
  const now = new Date();

  if (testMode) {
    now.setDate(now.getDate() - 1);
  }

  // END: today 06:00 KZ = today 01:00 UTC
  const nightEnd = new Date(now);
  nightEnd.setUTCHours(1, 0, 0, 0);

  // START: yesterday 15:00 KZ = yesterday 10:00 UTC
  const nightStart = new Date(nightEnd);
  nightStart.setUTCDate(nightEnd.getUTCDate() - 1);
  nightStart.setUTCHours(10, 0, 0, 0);

  return { nightStart, nightEnd };
}
