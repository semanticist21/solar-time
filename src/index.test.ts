import { test, expect, describe } from "vitest";
import { getSolarTime, getCurrentSolarTime } from "./index";
import dayjs from "dayjs";

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

      expect(typeof result.TC).toBe("number");
      expect(typeof result.EoT).toBe("number");
      expect(typeof result.B).toBe("number");
      expect(typeof result.LSTM).toBe("number");
      expect(dayjs.isDayjs(result.LST)).toBe(true);
    });

    test("should accept custom UTC offset", () => {
      const longitude = -122.4194;
      const result = getCurrentSolarTime(longitude, { utcOffset: -8 });

      expect(result.LSTM).toBe(120); // 15 * 8 = 120
    });
  });

  describe("getSolarTime", () => {
    test("should calculate correct LSTM for given UTC offset", () => {
      const date = new Date("2024-06-21T12:00:00Z");
      const longitude = -122.4194; // San Francisco
      const result = getSolarTime(date, longitude, { utcOffset: -8 });

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

      const inputTime = dayjs(date);
      const expectedTime = inputTime.add(result.TC, "minute");

      expect(result.LST.valueOf()).toBe(expectedTime.valueOf());
    });
  });
});
