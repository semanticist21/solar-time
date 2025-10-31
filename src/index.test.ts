import dayjs from "dayjs";
import {describe, expect, test} from "vitest";
import {getCurrentSolarTime, getSolarTime} from "./index";

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
});
