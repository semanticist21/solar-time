import {getSolarTime} from "./solar";
import type {SolarTimeOptions, SunPositionResult} from "./types";
import {addMinutes, getLocalTimeInMinutes, getUTCMidnight, getUTCOffset} from "./utils/date";

/**
 * Validate latitude value
 */
function validateLatitude(latitude: number): void {
  if (typeof latitude !== "number" || Number.isNaN(latitude)) {
    throw new Error("Latitude must be a valid number");
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90 degrees");
  }
}

/**
 * Calculate sun position using NOAA formulas (0.833° atmospheric refraction).
 * Note: sunrise/sunset are null in polar regions (polar night/midnight sun).
 *
 * @param isoDateTime - ISO 8601 string with timezone (e.g., "2025-11-01T09:00:00+09:00")
 * @param latitude - Latitude in degrees (-90 to 90, + = North, - = South)
 * @param longitude - Longitude in degrees (-180 to 180, + = East, - = West)
 * @param options - Optional: precision
 * @returns Sun position with times as ISO 8601 strings preserving timezone
 */
export const getSunPosition = (
  isoDateTime: string,
  latitude: number,
  longitude: number,
  options?: SolarTimeOptions
): SunPositionResult => {
  validateLatitude(latitude);

  const solarTime = getSolarTime(isoDateTime, longitude, options);
  const {declination, EoT} = solarTime;
  const offset = getUTCOffset(isoDateTime);

  const latRad = latitude * (Math.PI / 180);
  const declRad = declination * (Math.PI / 180);

  // Sunrise/sunset hour angle: cos(ω) = [cos(90.833°) - sin(φ)sin(δ)] / [cos(φ)cos(δ)]
  // 90.833° includes horizon (90°) + atmospheric refraction (0.833°)
  const zenithRad = 90.833 * (Math.PI / 180);
  const cosOmega =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  // Get UTC midnight once for all time calculations
  const utcMidnight = getUTCMidnight(isoDateTime);

  let sunrise: string | null = null;
  let sunset: string | null = null;

  // If |cosOmega| > 1, sun never rises/sets (polar regions)
  if (Math.abs(cosOmega) <= 1) {
    const omegaRad = Math.acos(cosOmega);
    const omegaDeg = omegaRad * (180 / Math.PI);

    const sunriseMinutes = 720 - 4 * (longitude + omegaDeg) - EoT;
    const sunsetMinutes = 720 - 4 * (longitude - omegaDeg) - EoT;

    sunrise = addMinutes(utcMidnight, sunriseMinutes, offset);
    sunset = addMinutes(utcMidnight, sunsetMinutes, offset);
  }

  // Solar noon: when sun is highest (hour angle = 0)
  const solarNoonMinutes = 720 - 4 * longitude - EoT;
  const solarNoon = addMinutes(utcMidnight, solarNoonMinutes, offset);

  // Current sun position (azimuth, elevation)
  const inputMinutes = getLocalTimeInMinutes(isoDateTime);
  const solarTimeMinutes = inputMinutes + solarTime.TC;

  let solarTimeHours = solarTimeMinutes / 60;
  if (solarTimeHours < 0) solarTimeHours += 24;
  if (solarTimeHours >= 24) solarTimeHours -= 24;

  // Hour angle: 15°/hour from solar noon
  const hourAngleDeg = 15 * (solarTimeHours - 12);
  const hourAngleRad = hourAngleDeg * (Math.PI / 180);

  // Elevation: sin(α) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(h)
  const sinElevation =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad);
  const elevationRad = Math.asin(sinElevation);
  const elevation = elevationRad * (180 / Math.PI);
  const zenith = 90 - elevation;

  // Azimuth: atan2 for quadrant handling
  const sinAz = (-Math.sin(hourAngleRad) * Math.cos(declRad)) / Math.cos(elevationRad);
  const cosAz =
    (Math.sin(declRad) - Math.sin(latRad) * sinElevation) /
    (Math.cos(latRad) * Math.cos(elevationRad));

  let azimuthDeg = Math.atan2(sinAz, cosAz) * (180 / Math.PI);
  if (azimuthDeg < 0) azimuthDeg += 360; // Convert -180...180 to 0...360

  return {
    sunrise,
    sunset,
    solarNoon,
    azimuth: azimuthDeg,
    elevation,
    zenith,
  };
};
