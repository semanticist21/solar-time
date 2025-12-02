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
 * Get UTC offset in hours from ISO 8601 string with timezone
 * @example getUTCOffset("2025-11-01T09:00:00+09:00") -> 9
 * @example getUTCOffset("2025-11-01T09:00:00-05:00") -> -5
 * @example getUTCOffset("2025-11-01T09:00:00Z") -> 0
 */
export function getUTCOffset(isoDateTime: string): number {
  if (isoDateTime.endsWith("Z")) return 0;

  const match = isoDateTime.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);

  return sign * (hours + minutes / 60);
}

/**
 * Get UTC midnight of the local date (accounting for timezone).
 * Returns midnight for the local date as ISO string, not the UTC date.
 * @param isoDateTime - ISO 8601 string with timezone
 * @returns UTC midnight (00:00:00) of the local date as ISO string
 */
export function getUTCMidnight(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const offset = getUTCOffset(isoDateTime);

  const localTime = d.getTime() + offset * 60 * 60 * 1000;
  const localDate = new Date(localTime);

  const utcMidnight = new Date(
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

  // Return as ISO string for consistency with other functions
  if (offset !== 0) {
    return formatWithTimezone(utcMidnight, offset);
  }
  return utcMidnight.toISOString();
}

/**
 * Add minutes to an ISO 8601 datetime and return new ISO 8601 string
 * Preserves timezone from input
 * @param isoDateTime - Base ISO 8601 datetime string
 * @param minutes - Minutes to add (can be negative)
 * @param timezoneOffset - UTC offset in hours
 */
export function addMinutes(isoDateTime: string, minutes: number, timezoneOffset: number): string {
  const d = new Date(isoDateTime);
  const newTime = new Date(d.getTime() + minutes * 60 * 1000);

  if (timezoneOffset !== 0) {
    return formatWithTimezone(newTime, timezoneOffset);
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
 * Get local time of day in minutes (0-1440), accounting for timezone.
 * @param isoDateTime - ISO 8601 string with timezone
 * @returns Minutes since midnight (0-1440 range)
 */
export function getLocalTimeInMinutes(isoDateTime: string): number {
  const dateObj = new Date(isoDateTime);
  const offset = getUTCOffset(isoDateTime);

  const utcMinutes =
    dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() + dateObj.getUTCSeconds() / 60;

  let localMinutes = utcMinutes + offset * 60;

  // Normalize to 0-1440 range
  if (localMinutes < 0) localMinutes += 1440;
  if (localMinutes >= 1440) localMinutes -= 1440;

  return localMinutes;
}
