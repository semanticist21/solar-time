/**
 * Options for solar time calculation
 */
export interface SolarTimeOptions {
  /**
   * Number of decimal places to round TC (Time Correction) value
   * @default undefined (no rounding)
   * @example
   * precision: 2 → TC: 12.34 minutes
   */
  precision?: number;
}

/**
 * Result of solar time calculation
 */
export interface SolarTimeResult {
  /**
   * Local Solar Time - ISO 8601 string with timezone (e.g., "2025-11-01T13:17:52-05:00")
   */
  LST: string;

  /**
   * Time Correction - Minutes to adjust from standard time to solar time
   */
  TC: number;

  /**
   * Equation of Time - Earth's orbit eccentricity correction in minutes
   */
  EoT: number;

  /**
   * Day Angle - Position in Earth's orbit in degrees
   */
  B: number;

  /**
   * Local Standard Time Meridian - Reference longitude for the time zone
   */
  LSTM: number;

  /**
   * Solar Declination - Angle between sun and equatorial plane in degrees
   * Range: -23.45° to +23.45°
   */
  declination: number;
}

/**
 * Result of sun position calculation
 */
export interface SunPositionResult {
  /**
   * Sunrise time as ISO 8601 string, null if sun doesn't rise (polar night)
   */
  sunrise: string | null;

  /**
   * Sunset time as ISO 8601 string, null if sun doesn't set (midnight sun)
   */
  sunset: string | null;

  /**
   * Solar noon time as ISO 8601 string - when sun is highest
   */
  solarNoon: string;

  /**
   * Solar azimuth angle in degrees (0° = North, 90° = East, 180° = South, 270° = West)
   * Range: 0° to 360°
   */
  azimuth: number;

  /**
   * Solar elevation/altitude angle in degrees above horizon
   * Range: -90° to +90° (negative = below horizon)
   */
  elevation: number;

  /**
   * Solar zenith angle in degrees from vertical
   * Range: 0° to 180° (complement of elevation)
   */
  zenith: number;
}
