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

export function formatCountdownDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
