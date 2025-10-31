import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import utc from "dayjs/plugin/utc";
import {getSolarTime} from "./solar";
import type {SolarTimeOptions, SunPositionResult} from "./types";

// plugins
dayjs.extend(dayOfYear);
dayjs.extend(utc);

/**
 * Calculate sun position (azimuth, elevation) and sunrise/sunset times.
 *
 * Uses NOAA Solar Position formulas with Spencer's Equation for declination.
 * Accounts for atmospheric refraction (0.833°).
 *
 * @param date - The date to calculate for (Date object, ISO string, or timestamp)
 * @param longitude - Longitude in degrees (-180 to 180, positive = East)
 * @param latitude - Latitude in degrees (-90 to 90, positive = North)
 * @param options - Optional configuration
 * @returns Sun position calculation results
 *
 * @example
 * ```typescript
 * const result = getSunPosition(new Date(), -98.583, 39.833, {utcOffset: -5});
 * console.log(result.sunrise?.toISOString());  // Sunrise time
 * console.log(result.azimuth);  // 180.5° (south)
 * console.log(result.elevation);  // 45.2° above horizon
 * ```
 */
export const getSunPosition = (
  date: Date | string | number,
  longitude: number,
  latitude: number,
  options?: SolarTimeOptions
): SunPositionResult => {
  const dayjsDate = dayjs(date);

  // Get solar time results for declination and EoT
  const solarTime = getSolarTime(date, longitude, options);
  const {declination, EoT} = solarTime;

  // Convert to radians
  const latRad = latitude * (Math.PI / 180);
  const declRad = declination * (Math.PI / 180);

  // Calculate sunrise/sunset hour angle
  // cos(ω) = [cos(90.833°) - sin(φ)sin(δ)] / [cos(φ)cos(δ)]
  const zenithRad = 90.833 * (Math.PI / 180); // Atmospheric refraction + solar disk
  const cosOmega =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  let sunrise: Date | null = null;
  let sunset: Date | null = null;

  // Check if sun rises/sets (|cosOmega| <= 1)
  if (Math.abs(cosOmega) <= 1) {
    const omegaRad = Math.acos(cosOmega);
    const omegaDeg = omegaRad * (180 / Math.PI);

    // Sunrise UTC time in minutes from UTC midnight
    const sunriseMinutes = 720 - 4 * (longitude + omegaDeg) - EoT;
    // Sunset UTC time in minutes from UTC midnight
    const sunsetMinutes = 720 - 4 * (longitude - omegaDeg) - EoT;

    // Convert to Date objects (from UTC midnight)
    const utcMidnight = dayjs(date).utc().startOf("day");
    sunrise = utcMidnight.add(sunriseMinutes, "minute").toDate();
    sunset = utcMidnight.add(sunsetMinutes, "minute").toDate();
  }

  // Solar Noon: when hour angle = 0 (UTC time in minutes from midnight)
  const solarNoonMinutes = 720 - 4 * longitude - EoT;
  const utcMidnight = dayjs(date).utc().startOf("day");
  const solarNoon = utcMidnight.add(solarNoonMinutes, "minute").toDate();

  // Calculate current sun position (azimuth, elevation)
  // Convert input time to minutes since midnight (local time)
  const inputMinutes = dayjsDate.hour() * 60 + dayjsDate.minute() + dayjsDate.second() / 60;

  // Add time correction to get solar time in minutes
  const solarTimeMinutes = inputMinutes + solarTime.TC;

  // Convert to hours (handle wrap-around for midnight)
  let solarTimeHours = solarTimeMinutes / 60;
  if (solarTimeHours < 0) solarTimeHours += 24;
  if (solarTimeHours >= 24) solarTimeHours -= 24;

  // Hour angle: 15° per hour from solar noon (0° at noon, negative before noon, positive after)
  const hourAngleDeg = 15 * (solarTimeHours - 12);
  const hourAngleRad = hourAngleDeg * (Math.PI / 180);

  // Solar elevation: sin(α) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(h)
  const sinElevation =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad);
  const elevationRad = Math.asin(sinElevation);
  const elevation = elevationRad * (180 / Math.PI);

  // Solar zenith (complement of elevation)
  const zenith = 90 - elevation;

  // Solar azimuth (from north, clockwise)
  // Using atan2 for proper quadrant handling
  // sin(Az) = -sin(ha)cos(decl) / cos(elev)
  // cos(Az) = [sin(decl) - sin(lat)sin(elev)] / [cos(lat)cos(elev)]
  const sinAz = (-Math.sin(hourAngleRad) * Math.cos(declRad)) / Math.cos(elevationRad);
  const cosAz =
    (Math.sin(declRad) - Math.sin(latRad) * sinElevation) /
    (Math.cos(latRad) * Math.cos(elevationRad));

  let azimuthDeg = Math.atan2(sinAz, cosAz) * (180 / Math.PI);

  // Convert from -180...180 to 0...360 (north = 0, east = 90, south = 180, west = 270)
  if (azimuthDeg < 0) {
    azimuthDeg += 360;
  }

  return {
    sunrise,
    sunset,
    solarNoon,
    azimuth: azimuthDeg,
    elevation,
    zenith,
  };
};
