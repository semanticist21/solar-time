/**
 * Date utility functions to replace dayjs dependency
 */

/**
 * Calculate day of year (1-365/366) based on UTC date
 * This matches the behavior of dayjs().dayOfYear()
 */
export function getDayOfYear(date: Date): number {
  // Use UTC date components to calculate day of year
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Create UTC date at start of year
  const startOfYear = Date.UTC(year, 0, 0);
  // Create UTC date for the given day
  const targetDate = Date.UTC(year, month, day);

  const diff = targetDate - startOfYear;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Parse ISO 8601 string and extract UTC offset in hours
 * @example "2025-11-01T09:00:00+09:00" -> 9
 * @example "2025-11-01T09:00:00-05:00" -> -5
 */
export function parseUTCOffset(isoString: string): number {
  // Check for Z (UTC)
  if (isoString.endsWith('Z')) return 0;

  // Match timezone offset: +09:00 or -05:00
  const match = isoString.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;

  const sign = match[1] === '+' ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);

  return sign * (hours + minutes / 60);
}

/**
 * Get UTC offset in hours from date input
 * For ISO strings with timezone info, extracts it
 * For Date objects/timestamps or ISO strings without timezone, returns 0
 */
export function getUTCOffset(date: Date | string | number): number {
  if (typeof date === 'string') {
    return parseUTCOffset(date);
  }

  // For Date objects or timestamps, return 0 (UTC)
  // User should provide explicit utcOffset option if needed
  return 0;
}

/**
 * Get UTC midnight for a given date's LOCAL date
 * For timezone-aware calculations, we need the UTC midnight of the LOCAL date,
 * not the UTC date
 */
export function getUTCMidnight(date: Date | string | number): Date {
  const d = toDate(date);
  const offset = getUTCOffset(date);

  // Get local date components by adding offset to UTC
  const localTime = d.getTime() + offset * 60 * 60 * 1000;
  const localDate = new Date(localTime);

  // Use local year/month/day to create UTC midnight
  return new Date(Date.UTC(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Add minutes to a date and return ISO string
 */
export function addMinutes(date: Date, minutes: number): string {
  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
}

/**
 * Convert any date input to Date object
 */
export function toDate(date: Date | string | number): Date {
  return typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
}

/**
 * Get local time of day in minutes (accounting for timezone)
 * For ISO strings with timezone, this returns the time in that timezone
 */
export function getLocalTimeInMinutes(date: Date | string | number): number {
  const dateObj = toDate(date);
  const offset = getUTCOffset(date);

  // Get UTC time in minutes
  const utcMinutes = dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() + dateObj.getUTCSeconds() / 60;

  // Add timezone offset to get local time
  let localMinutes = utcMinutes + offset * 60;

  // Normalize to 0-1440 range (24 hours)
  if (localMinutes < 0) localMinutes += 1440;
  if (localMinutes >= 1440) localMinutes -= 1440;

  return localMinutes;
}
