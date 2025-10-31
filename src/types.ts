/**
 * Options for solar time calculation
 */
export interface SolarTimeOptions {
  /**
   * UTC offset in hours (e.g., -8 for PST, +9 for JST)
   * Defaults to the local timezone offset if not provided
   */
  utcOffset?: number;

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
   * Local Solar Time - The date/time adjusted to solar time
   */
  LST: Date;

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
