export function getNightTimeWindow({ testMode = false, manualMode = false } = {}) {
  const now = new Date();

  if (testMode) {
    now.setDate(now.getDate() - 1);
  }

  if (manualMode) {
    // Manual: evening matches from 15:00 KZ (10:00 UTC) up to now
    const nightStart = new Date(now);
    nightStart.setUTCHours(10, 0, 0, 0);
    // If 10:00 UTC hasn't arrived yet today, use yesterday's evening
    if (nightStart > now) {
      nightStart.setUTCDate(nightStart.getUTCDate() - 1);
    }
    return { nightStart, nightEnd: new Date(now) };
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
