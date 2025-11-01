import type {SolarTimeOptions, SolarTimeResult} from "./types";
import {addMinutes, getDayOfYear, getUTCOffset, toDate} from "./utils/date";

/**
 * Calculate local solar time using Spencer's Equation (±30s accuracy).
 *
 * @param date - Date object, ISO string, or timestamp
 * @param longitude - Longitude in degrees (-180 to 180)
 * @param options - Optional: utcOffset, precision
 * @returns Solar time results with LST as ISO 8601 string preserving timezone
 */
export const getSolarTime = (
  date: Date | string | number,
  longitude: number,
  options?: SolarTimeOptions
): SolarTimeResult => {
  const dateObj = toDate(date);

  const offset = options?.utcOffset ?? getUTCOffset(date);
  const LSTM = 15 * offset;

  // Day angle (radians, day 1 = Jan 1)
  const T = (2 * Math.PI * (getDayOfYear(dateObj) - 1)) / 365;

  // Spencer's Equation: EoT (minutes)
  const EoT =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(T) -
      0.032077 * Math.sin(T) -
      0.014615 * Math.cos(2 * T) -
      0.040849 * Math.sin(2 * T));

  // Spencer's Equation: Solar declination (radians)
  const declinationRad =
    0.006918 -
    0.399912 * Math.cos(T) +
    0.070257 * Math.sin(T) -
    0.006758 * Math.cos(2 * T) +
    0.000907 * Math.sin(2 * T) -
    0.002697 * Math.cos(3 * T) +
    0.00148 * Math.sin(3 * T);

  const declination = declinationRad * (180 / Math.PI);
  const B = (360 / 365) * (getDayOfYear(dateObj) - 1); // Day angle (degrees)

  let TC = 4 * (longitude - LSTM) + EoT;

  if (options?.precision !== undefined) {
    const factor = 10 ** options.precision;
    TC = Math.round(TC * factor) / factor;
  }

  return {
    LST: addMinutes(dateObj, TC),
    TC,
    EoT,
    B,
    LSTM,
    declination,
  };
};

/**
 * Calculate solar time for current moment. Convenience wrapper for `getSolarTime(new Date(), ...)`.
 *
 * @param longitude - Longitude in degrees (-180 to 180)
 * @param options - Optional: utcOffset, precision
 * @returns Solar time calculation results
 */
export const getCurrentSolarTime = (
  longitude: number,
  options?: SolarTimeOptions
): SolarTimeResult => {
  return getSolarTime(new Date(), longitude, options);
};
