/** Local calendar date as "YYYY-MM-DD", using the device's own timezone. */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface StreakStats {
  current: number;
  longest: number;
  checkedInToday: boolean;
}

/**
 * Computes streak stats from a list of check-in date keys.
 * A streak stays "alive" (not yet broken) if the most recent check-in was
 * today or yesterday — matching how most habit-streak apps behave, so
 * missing today doesn't zero out the count until the day is actually over.
 */
export function computeStreakStats(dateKeys: string[]): StreakStats {
  const set = new Set(dateKeys);
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const checkedInToday = set.has(todayKey);

  // Current streak: walk backward from today (or yesterday, if today isn't
  // checked in yet) for as long as each consecutive day is present.
  const cursor = new Date(today);
  if (!checkedInToday) cursor.setDate(cursor.getDate() - 1);

  let current = 0;
  while (set.has(getLocalDateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak: scan all recorded days for the longest consecutive run.
  const sortedDates = [...set]
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d).getTime();
    })
    .sort((a, b) => a - b);

  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  const oneDay = 24 * 60 * 60 * 1000;
  for (const t of sortedDates) {
    if (prev !== null && t - prev === oneDay) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = t;
  }

  return { current, longest: Math.max(longest, current), checkedInToday };
}

/** Last 7 calendar days (oldest to newest), each flagged whether checked in. */
export function getLast7Days(dateKeys: string[]) {
  const set = new Set(dateKeys);
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (6 - i));
    const key = getLocalDateKey(day);
    return { key, checkedIn: set.has(key), weekday: day.getDay() };
  });
}
