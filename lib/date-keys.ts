export function getTodayDateKey(date = new Date()) {
  return date.toLocaleDateString("en-CA");
}

export function getNextLocalMidnight(from = new Date()) {
  return new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + 1,
    0,
    0,
    0,
    0,
  );
}

export function getMillisecondsUntilLocalMidnight(from = new Date()) {
  return Math.max(0, getNextLocalMidnight(from).getTime() - from.getTime());
}
