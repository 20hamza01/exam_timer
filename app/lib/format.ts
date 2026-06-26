/**
 * Time formatting helpers. All durations are in milliseconds.
 */

/**
 * Format a duration as a clock string.
 * - Shows `H:MM:SS` when there is at least one hour, otherwise `MM:SS`.
 * - Negative values (e.g. a question that went over budget) are prefixed with "-".
 */
export function formatClock(ms: number): string {
  const negative = ms < 0;
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const body =
    hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  return negative ? `-${body}` : body;
}

/**
 * Compact human label for a duration, e.g. "1h 30m" or "45s".
 * Used in the summary screen where exactness to the second is less important.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(Math.abs(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}
