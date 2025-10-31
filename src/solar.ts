import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import type {SolarTimeOptions, SolarTimeResult} from "./types";

// plugins
dayjs.extend(dayOfYear);

/**
 * Calculate local solar time for a specific date and location.
 *
 * Uses Spencer's Equation for the Equation of Time (EoT) calculation,
 * providing accuracy within ±30 seconds.
 *
 * @param date - The date to calculate solar time for (Date object, ISO string, or timestamp)
 * @param longitude - The longitude of the location in degrees (-180 to 180)
 * @param options - Optional configuration
 * @returns Solar time calculation results
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = getSolarTime(new Date(), -122.4194);
 *
 * // With custom UTC offset and precision
 * const result = getSolarTime("2024-06-21T12:00:00Z", 127.5, {
 *   utcOffset: 9,
 *   precision: 2  // Round TC to 2 decimal places
 * });
 *
 * // Access results
 * console.log(result.LST);  // Local Solar Time (Date object)
 * console.log(result.TC);   // Time correction in minutes (e.g., 12.34)
 * ```
 */
export const getSolarTime = (
  date: Date | string | number,
  longitude: number,
  options?: SolarTimeOptions
): SolarTimeResult => {
  const dayjsDate = dayjs(date);

  // Use provided UTC offset or default to the date's timezone offset
  const offset = options?.utcOffset ?? dayjsDate.utcOffset() / 60;

  const LSTM = 15 * Math.abs(offset);

  // Day angle in radians (Spencer's formula uses day 1 = Jan 1)
  const T = (2 * Math.PI * (dayjsDate.dayOfYear() - 1)) / 365;

  // Spencer's Equation for Equation of Time (±30 seconds accuracy)
  const EoT =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(T) -
      0.032077 * Math.sin(T) -
      0.014615 * Math.cos(2 * T) -
      0.040849 * Math.sin(2 * T));

  // Spencer's Equation for Solar Declination (in radians)
  const declinationRad =
    0.006918 -
    0.399912 * Math.cos(T) +
    0.070257 * Math.sin(T) -
    0.006758 * Math.cos(2 * T) +
    0.000907 * Math.sin(2 * T) -
    0.002697 * Math.cos(3 * T) +
    0.00148 * Math.sin(3 * T);

  // Convert declination to degrees
  const declination = declinationRad * (180 / Math.PI);

  // Day angle in degrees (for backward compatibility)
  const B = (360 / 365) * (dayjsDate.dayOfYear() - 1);

  let TC = 4 * (longitude - LSTM) + EoT;

  // Apply precision rounding if specified
  if (options?.precision !== undefined) {
    const factor = 10 ** options.precision;
    TC = Math.round(TC * factor) / factor;
  }

  return {
    LST: dayjsDate.add(TC, "minute").toDate(),
    TC,
    EoT,
    B,
    LSTM,
    declination,
  };
};

/**
 * Calculate local solar time for the current moment.
 *
 * Convenience function that calls `getSolarTime` with the current date/time.
 *
 * @param longitude - The longitude of the location in degrees (-180 to 180)
 * @param options - Optional configuration
 * @returns Solar time calculation results
 *
 * @example
 * ```typescript
 * // Calculate current solar time in San Francisco
 * const result = getCurrentSolarTime(-122.4194, {utcOffset: -8});
 * console.log(result.LST.toISOString());
 * ```
 */
export const getCurrentSolarTime = (
  longitude: number,
  options?: SolarTimeOptions
): SolarTimeResult => {
  return getSolarTime(new Date(), longitude, options);
};
