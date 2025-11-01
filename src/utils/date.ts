/**
 * Calculate day of year (1-365/366) using UTC date components.
 * Uses UTC to ensure consistent calculations regardless of local timezone.
 * @param date - Date to calculate day of year for
 * @returns Day of year (1 = Jan 1, 365/366 = Dec 31)
 */
export function getDayOfYear(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const startOfYear = Date.UTC(year, 0, 0);
  const targetDate = Date.UTC(year, month, day);
  const diff = targetDate - startOfYear;

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get UTC offset in hours from date input
 * For ISO strings with timezone, extracts offset; otherwise returns 0
 * @example getUTCOffset("2025-11-01T09:00:00+09:00") -> 9
 * @example getUTCOffset("2025-11-01T09:00:00-05:00") -> -5
 * @example getUTCOffset(new Date()) -> 0
 */
export function getUTCOffset(date: Date | string | number): number {
  if (typeof date !== "string") return 0;
  if (date.endsWith("Z")) return 0;

  const match = date.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);

  return sign * (hours + minutes / 60);
}

/**
 * Get UTC midnight of the local date (accounting for timezone).
 * Returns midnight for the local date, not the UTC date.
 * @param date - Date object, ISO string, or timestamp
 * @returns UTC midnight (00:00:00) of the local date
 */
export function getUTCMidnight(date: Date | string | number): Date {
  const d = toDate(date);
  const offset = getUTCOffset(date);

  const localTime = d.getTime() + offset * 60 * 60 * 1000;
  const localDate = new Date(localTime);

  return new Date(
    Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

/**
 * Add minutes to a date and return ISO 8601 string
 * Preserves timezone from ISO string input or uses provided offset
 * @param date - Base date/time
 * @param minutes - Minutes to add (can be negative)
 * @param timezoneOffset - Optional UTC offset in hours (overrides auto-detection)
 */
export function addMinutes(
  date: Date | string | number,
  minutes: number,
  timezoneOffset?: number
): string {
  const d = toDate(date);
  const newTime = new Date(d.getTime() + minutes * 60 * 1000);

  // Use provided offset, or auto-detect from input
  const offset = timezoneOffset ?? getUTCOffset(date);

  if (offset !== 0) {
    return formatWithTimezone(newTime, offset);
  }

  return newTime.toISOString();
}

/**
 * Format Date as ISO 8601 string with timezone offset.
 * @internal
 */
function formatWithTimezone(date: Date, offsetHours: number): string {
  const localTime = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);

  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localTime.getUTCDate()).padStart(2, "0");
  const hours = String(localTime.getUTCHours()).padStart(2, "0");
  const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(localTime.getUTCSeconds()).padStart(2, "0");

  const sign = offsetHours >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetHours);
  const offsetHrs = String(Math.floor(absOffset)).padStart(2, "0");
  const offsetMins = String(Math.round((absOffset % 1) * 60)).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHrs}:${offsetMins}`;
}

/**
 * Convert any date input to Date object
 */
export function toDate(date: Date | string | number): Date {
  return typeof date === "string" || typeof date === "number" ? new Date(date) : date;
}

/**
 * Get local time of day in minutes (0-1440), accounting for timezone.
 * @param date - Date object, ISO string, or timestamp
 * @returns Minutes since midnight (0-1440 range)
 */
export function getLocalTimeInMinutes(date: Date | string | number): number {
  const dateObj = toDate(date);
  const offset = getUTCOffset(date);

  const utcMinutes =
    dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() + dateObj.getUTCSeconds() / 60;

  let localMinutes = utcMinutes + offset * 60;

  // Normalize to 0-1440 range
  if (localMinutes < 0) localMinutes += 1440;
  if (localMinutes >= 1440) localMinutes -= 1440;

  return localMinutes;
}
