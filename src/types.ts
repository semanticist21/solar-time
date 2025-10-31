import type { Dayjs } from "dayjs";

/**
 * Options for solar time calculation
 */
export interface SolarTimeOptions {
  /**
   * UTC offset in hours (e.g., -8 for PST, +9 for JST)
   * Defaults to the local timezone offset if not provided
   */
  utcOffset?: number;

  // Future extensibility:
  // timezone?: string;           // IANA timezone (e.g., "America/Los_Angeles")
  // precision?: "standard" | "high";  // Calculation precision level
  // includeMetadata?: boolean;   // Include additional calculation metadata
}

/**
 * Result of solar time calculation
 */
export interface SolarTimeResult {
  /**
   * Local Solar Time - The date/time adjusted to solar time
   */
  LST: Dayjs;

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
}
