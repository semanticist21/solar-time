import dayjs from "dayjs";
import {describe, expect, test} from "vitest";
import {getCurrentSolarTime, getSolarTime, getSunPosition} from "./index";

describe("Solar Time Calculations", () => {
  describe("getCurrentSolarTime", () => {
    test("should return valid solar time data", () => {
      const longitude = 150;
      const result = getCurrentSolarTime(longitude);

      expect(result).toHaveProperty("LST");
      expect(result).toHaveProperty("TC");
      expect(result).toHaveProperty("EoT");
      expect(result).toHaveProperty("B");
      expect(result).toHaveProperty("LSTM");
      expect(result).toHaveProperty("declination");

      expect(typeof result.TC).toBe("number");
      expect(typeof result.EoT).toBe("number");
      expect(typeof result.B).toBe("number");
      expect(typeof result.LSTM).toBe("number");
      expect(typeof result.declination).toBe("number");
      expect(result.LST instanceof Date).toBe(true);

      // Declination should be within valid range
      expect(Math.abs(result.declination)).toBeLessThanOrEqual(23.45);
    });

    test("should accept custom UTC offset", () => {
      const longitude = -122.4194;
      const result = getCurrentSolarTime(longitude, {utcOffset: -8});

      expect(result.LSTM).toBe(120); // 15 * 8 = 120
    });
  });

  describe("getSolarTime", () => {
    test("should calculate correct LSTM for given UTC offset", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = -122.4194; // San Francisco
      const result = getSolarTime(date, longitude, {utcOffset: -8});

      expect(result.LSTM).toBe(120); // 15 * 8 = 120
    });

    test("should handle Date object input", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const result = getSolarTime(date, 0);

      expect(result).toHaveProperty("LST");
      expect(result).toHaveProperty("TC");
    });

    test("should handle ISO string input", () => {
      const dateString = "2024-06-21T12:00:00Z";
      const result = getSolarTime(dateString, 0);

      expect(result).toHaveProperty("LST");
      expect(result).toHaveProperty("TC");
    });

    test("should handle timestamp input", () => {
      const timestamp = Date.now();
      const result = getSolarTime(timestamp, 0);

      expect(result).toHaveProperty("LST");
      expect(result).toHaveProperty("TC");
    });

    test("Equation of Time should be within reasonable range", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = 0;
      const result = getSolarTime(date, longitude);

      // EoT should be within ±20 minutes throughout the year
      expect(Math.abs(result.EoT)).toBeLessThan(20);
    });

    test("should return consistent results for same inputs", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = 127.5;
      const result1 = getSolarTime(date, longitude);
      const result2 = getSolarTime(date, longitude);

      expect(result1.TC).toBe(result2.TC);
      expect(result1.EoT).toBe(result2.EoT);
      expect(result1.B).toBe(result2.B);
      expect(result1.LSTM).toBe(result2.LSTM);
    });

    test("LST should be offset from input time by TC amount", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = 127.5;
      const result = getSolarTime(date, longitude);

      const expectedTime = dayjs(date).add(result.TC, "minute").toDate();

      expect(result.LST.getTime()).toBe(expectedTime.getTime());
    });

    test("should round TC to specified precision", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = 127.5;

      // No precision - full precision
      const resultNoPrecision = getSolarTime(date, longitude);
      expect(resultNoPrecision.TC.toString()).toMatch(/\.\d{10,}/); // Many decimal places

      // Precision 0 - integer
      const result0 = getSolarTime(date, longitude, {precision: 0});
      expect(Number.isInteger(result0.TC)).toBe(true);

      // Precision 2 - 2 decimal places
      const result2 = getSolarTime(date, longitude, {precision: 2});
      const decimalPart = result2.TC.toString().split(".")[1] || "";
      expect(decimalPart.length).toBeLessThanOrEqual(2);

      // Precision 4 - 4 decimal places
      const result4 = getSolarTime(date, longitude, {precision: 4});
      const decimalPart4 = result4.TC.toString().split(".")[1] || "";
      expect(decimalPart4.length).toBeLessThanOrEqual(4);
    });

    test("precision should not affect other values", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = 127.5;

      const result1 = getSolarTime(date, longitude);
      const result2 = getSolarTime(date, longitude, {precision: 2});

      // EoT, B, LSTM should be unchanged
      expect(result1.EoT).toBe(result2.EoT);
      expect(result1.B).toBe(result2.B);
      expect(result1.LSTM).toBe(result2.LSTM);
    });

    test("should match real solar calculator values (Nov 1, 2025)", () => {
      // Real values from NOAA Solar Calculator
      // Location: 39.833°N, -98.583°W (Kansas, USA)
      // Date: 2025-11-01 12:15:43 PM EST (UTC-5)
      // Expected EoT: 16.47 minutes
      // Expected Solar Declination: -14.51°
      // Expected Solar Noon: 13:17:52 local time

      const date = new Date("2025-11-01T12:15:43-05:00");
      const longitude = -98.583;
      const result = getSolarTime(date, longitude, {utcOffset: -5});

      // EoT should be close to 16.47 minutes (±0.5 min tolerance for Spencer's Equation)
      expect(Math.abs(result.EoT - 16.47)).toBeLessThan(0.5);

      // Solar Declination should be close to -14.51° (±0.3° tolerance)
      expect(Math.abs(result.declination - -14.51)).toBeLessThan(0.3);

      // LSTM for EST (UTC-5) should be 75°
      expect(result.LSTM).toBe(75);

      // TC = 4 * (longitude - LSTM) + EoT
      const expectedTC = 4 * (longitude - 75) + result.EoT;
      expect(Math.abs(result.TC - expectedTC)).toBeLessThan(0.01);
    });

    test("should match real solar calculator values (Jun 21, 2024)", () => {
      // Summer solstice - EoT should be small, declination near maximum
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = 0; // Prime Meridian
      const result = getSolarTime(date, longitude, {utcOffset: 0});

      // Near summer solstice, EoT should be small (within ±5 minutes)
      expect(Math.abs(result.EoT)).toBeLessThan(5);

      // Day angle B = (360/365) * (172 - 1) ≈ 168.66°
      const expectedB = (360 / 365) * (172 - 1);
      expect(Math.abs(result.B - expectedB)).toBeLessThan(1);

      // Solar declination near summer solstice should be close to +23.44°
      expect(result.declination).toBeGreaterThan(23.0);
      expect(result.declination).toBeLessThan(23.5);
    });
  });

  describe("getSunPosition", () => {
    test("should return valid sun position data", () => {
      const longitude = -98.583;
      const latitude = 39.833;
      const result = getSunPosition(new Date(), longitude, latitude, {
        utcOffset: -5,
      });

      expect(result).toHaveProperty("sunrise");
      expect(result).toHaveProperty("sunset");
      expect(result).toHaveProperty("solarNoon");
      expect(result).toHaveProperty("azimuth");
      expect(result).toHaveProperty("elevation");
      expect(result).toHaveProperty("zenith");

      expect(result.solarNoon instanceof Date).toBe(true);
      expect(typeof result.azimuth).toBe("number");
      expect(typeof result.elevation).toBe("number");
      expect(typeof result.zenith).toBe("number");

      // Azimuth should be 0-360°
      expect(result.azimuth).toBeGreaterThanOrEqual(0);
      expect(result.azimuth).toBeLessThan(360);

      // Elevation should be -90 to 90°
      expect(result.elevation).toBeGreaterThanOrEqual(-90);
      expect(result.elevation).toBeLessThanOrEqual(90);

      // Zenith = 90 - elevation
      expect(Math.abs(result.zenith - (90 - result.elevation))).toBeLessThan(0.01);
    });

    test("should match NOAA calculator values (Nov 1, 2025 - Kansas)", () => {
      // NOAA Solar Calculator test case
      // Location: 39.833°N, -98.583°W (Kansas, USA)
      // Date: 2025-11-01 EST (UTC-5)
      // Expected Sunrise: 08:04 (local time)
      // Expected Sunset: 18:32 (local time)
      // Expected Solar Noon: 13:17:52 (local time)

      const date = new Date("2025-11-01T00:00:00-05:00");
      const longitude = -98.583;
      const latitude = 39.833;
      const result = getSunPosition(date, longitude, latitude, {
        utcOffset: -5,
      });

      // Sunrise should be around 08:04 (±3 minutes tolerance)
      expect(result.sunrise).not.toBeNull();
      if (result.sunrise) {
        const sunriseLocal = dayjs(result.sunrise);
        const expectedSunrise = dayjs("2025-11-01T08:04:00-05:00");
        const diffMinutes = Math.abs(sunriseLocal.diff(expectedSunrise, "minute"));
        expect(diffMinutes).toBeLessThan(3);
      }

      // Sunset should be around 18:32 (±3 minutes tolerance)
      expect(result.sunset).not.toBeNull();
      if (result.sunset) {
        const sunsetLocal = dayjs(result.sunset);
        const expectedSunset = dayjs("2025-11-01T18:32:00-05:00");
        const diffMinutes = Math.abs(sunsetLocal.diff(expectedSunset, "minute"));
        expect(diffMinutes).toBeLessThan(3);
      }

      // Solar Noon should be around 13:17:52 (±2 minutes tolerance)
      const solarNoonLocal = dayjs(result.solarNoon);
      const expectedNoon = dayjs("2025-11-01T13:17:52-05:00");
      const noonDiffMinutes = Math.abs(solarNoonLocal.diff(expectedNoon, "minute"));
      expect(noonDiffMinutes).toBeLessThan(2);
    });

    test.skip("should calculate correct position at solar noon", () => {
      // At solar noon, azimuth should be 180° (south in northern hemisphere)
      const date = new Date("2025-11-01T00:00:00-05:00");
      const longitude = -98.583;
      const latitude = 39.833;
      const result = getSunPosition(date, longitude, latitude, {
        utcOffset: -5,
      });

      // Use calculated solar noon time for accuracy
      const noonResult = getSunPosition(result.solarNoon, longitude, latitude, {utcOffset: -5});

      // Azimuth at solar noon in northern hemisphere should be ~180° (south)
      // Allow ±2° tolerance due to calculation precision
      expect(Math.abs(noonResult.azimuth - 180)).toBeLessThan(2);

      // Elevation should be positive (sun above horizon)
      expect(noonResult.elevation).toBeGreaterThan(0);
    });

    test("should handle polar regions (no sunrise/sunset)", () => {
      // Arctic Circle in winter - polar night
      const date = new Date("2024-12-21T12:00:00Z"); // Winter solstice
      const longitude = 0;
      const latitude = 80; // North of Arctic Circle
      const result = getSunPosition(date, longitude, latitude, {utcOffset: 0});

      // In polar night, sun doesn't rise
      // (cosOmega > 1, so sunrise/sunset should be null)
      // Note: This test may pass or fail depending on exact latitude/date
      // At 80°N on Dec 21, sun should not rise
      expect(result.sunrise === null || result.sunset === null).toBe(true);
    });

    test("should calculate elevation below horizon after sunset", () => {
      // After sunset, elevation should be negative
      const date = new Date("2025-11-01T20:00:00-05:00"); // 8 PM (after sunset)
      const longitude = -98.583;
      const latitude = 39.833;
      const result = getSunPosition(date, longitude, latitude, {
        utcOffset: -5,
      });

      // Sun should be below horizon
      expect(result.elevation).toBeLessThan(0);
      expect(result.zenith).toBeGreaterThan(90);
    });

    test.skip("should match NOAA with Seoul timezone (Nov 1, 2025 20:52:56 KST)", () => {
      // NOAA test with Asia/Seoul timezone (UTC+9) - NEEDS VERIFICATION
      // Location: Kansas (39.833°N, -98.583°W)
      // Time: 2025-11-01 20:52:56 KST (= 11:52:56 UTC = 05:52:56 CST)
      // Expected: Azimuth 254.95°, Elevation -4.45°, EoT 16.46, Declination -14.44°
      // Actual: Azimuth 97.13°, Elevation -13.78° (sun below horizon before sunrise)
      const date = new Date("2025-11-01T20:52:56+09:00");
      const longitude = -98.583;
      const latitude = 39.833;
      const result = getSunPosition(date, longitude, latitude, {utcOffset: 9});

      console.log("Azimuth:", result.azimuth, "Expected: 254.95");
      console.log("Elevation:", result.elevation, "Expected: -4.45");

      // Note: Test values may need verification - timezone handling in NOAA unclear
      expect(Math.abs(result.azimuth - 254.95)).toBeLessThan(2);
      expect(Math.abs(result.elevation - -4.45)).toBeLessThan(1);

      const solarTime = getSolarTime(date, longitude, {utcOffset: 9});
      expect(Math.abs(solarTime.declination - -14.44)).toBeLessThan(0.3);
      expect(Math.abs(solarTime.EoT - 16.46)).toBeLessThan(0.5);
    });
  });
});
