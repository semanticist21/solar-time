import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import type { SolarTimeResult, SolarTimeOptions } from "./types";

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
 * // With custom UTC offset
 * const result = getSolarTime("2024-06-21T12:00:00Z", 127.5, { utcOffset: 9 });
 *
 * // Access results
 * console.log(result.LST);  // Local Solar Time (Dayjs object)
 * console.log(result.TC);   // Time correction in minutes
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

  const B = (360 / 365) * (dayjsDate.dayOfYear() - 81);
  const B_rad = B * (Math.PI / 180);

  // Spencer's Equation for improved accuracy (±30 seconds vs ±2 minutes)
  const EoT =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(B_rad) -
      0.032077 * Math.sin(B_rad) -
      0.014615 * Math.cos(2 * B_rad) -
      0.040849 * Math.sin(2 * B_rad));

  const TC = 4 * (longitude - LSTM) + EoT;

  return {
    LST: dayjsDate.add(TC, "minute"),
    TC,
    EoT,
    B,
    LSTM,
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
 * const result = getCurrentSolarTime(-122.4194, { utcOffset: -8 });
 * console.log(result.LST.format("HH:mm:ss"));
 * ```
 */
export const getCurrentSolarTime = (
  longitude: number,
  options?: SolarTimeOptions
): SolarTimeResult => {
  return getSolarTime(new Date(), longitude, options);
};
