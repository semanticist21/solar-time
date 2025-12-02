import type {SolarTimeOptions, SolarTimeResult} from "./types";
import {addMinutes, getDayOfYear, getUTCOffset} from "./utils/date";

/**
 * Validate longitude value
 */
function validateLongitude(longitude: number): void {
  if (typeof longitude !== "number" || Number.isNaN(longitude)) {
    throw new Error("Longitude must be a valid number");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180 degrees");
  }
}

/**
 * Validate ISO 8601 string format
 */
function validateISOString(isoDateTime: string): void {
  if (typeof isoDateTime !== "string") {
    throw new Error("DateTime must be an ISO 8601 string");
  }
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid ISO 8601 datetime string");
  }
}

/**
 * Calculate local solar time using Spencer's Equation (±30s accuracy).
 *
 * @param isoDateTime - ISO 8601 string with timezone (e.g., "2025-11-01T09:00:00+09:00")
 * @param longitude - Longitude in degrees (-180 to 180, + = East, - = West)
 * @param options - Optional: precision
 * @returns Solar time results with LST as ISO 8601 string preserving timezone
 */
export const getSolarTime = (
  isoDateTime: string,
  longitude: number,
  options?: SolarTimeOptions
): SolarTimeResult => {
  validateISOString(isoDateTime);
  validateLongitude(longitude);

  const dateObj = new Date(isoDateTime);
  const offset = getUTCOffset(isoDateTime);
  const LSTM = 15 * offset;

  // Day angle T in radians (day 1 = Jan 1)
  const dayOfYear = getDayOfYear(dateObj);
  const T = (2 * Math.PI * (dayOfYear - 1)) / 365;

  // Spencer's Equation for Equation of Time (minutes)
  // Using corrected coefficient 0.0000075 (Spencer's 1998 correction)
  const EoT =
    (1440 / (2 * Math.PI)) *
    (0.0000075 +
      0.001868 * Math.cos(T) -
      0.032077 * Math.sin(T) -
      0.014615 * Math.cos(2 * T) -
      0.040849 * Math.sin(2 * T));

  // Spencer's Equation for solar declination (radians)
  const declinationRad =
    0.006918 -
    0.399912 * Math.cos(T) +
    0.070257 * Math.sin(T) -
    0.006758 * Math.cos(2 * T) +
    0.000907 * Math.sin(2 * T) -
    0.002697 * Math.cos(3 * T) +
    0.00148 * Math.sin(3 * T);

  const declination = declinationRad * (180 / Math.PI);
  const B = (360 / 365) * (dayOfYear - 1); // Day angle in degrees

  // Time Correction: TC = 4 * (longitude - LSTM) + EoT
  let TC = 4 * (longitude - LSTM) + EoT;

  if (options?.precision !== undefined) {
    const factor = 10 ** options.precision;
    TC = Math.round(TC * factor) / factor;
  }

  return {
    LST: addMinutes(isoDateTime, TC, offset), // Preserve timezone from input
    TC,
    EoT,
    B,
    LSTM,
    declination,
  };
};
