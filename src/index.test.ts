import { test, expect, describe } from "vitest";
import { Solar, SolarNow } from "./index";
import dayjs from "dayjs";

describe("Solar Time Calculations", () => {
  test("SolarNow should return valid solar time data", () => {
    const longitude = 150;
    const result = SolarNow(longitude);

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

  test("Solar should calculate correct LSTM for given UTC offset", () => {
    const date = new Date("2024-06-21T12:00:00Z");
    const longitude = -122.4194; // San Francisco
    const result = Solar(date, longitude, { utc: -8 });

    expect(result.LSTM).toBe(120); // 15 * 8 = 120
  });

  test("Equation of Time should be within reasonable range", () => {
    const date = new Date("2024-06-21T12:00:00Z");
    const longitude = 0;
    const result = Solar(date, longitude);

    // EoT should be within ±20 minutes throughout the year
    expect(Math.abs(result.EoT)).toBeLessThan(20);
  });

  test("Solar should return consistent results for same inputs", () => {
    const date = new Date("2024-06-21T12:00:00Z");
    const longitude = 127.5;
    const result1 = Solar(date, longitude);
    const result2 = Solar(date, longitude);

    expect(result1.TC).toBe(result2.TC);
    expect(result1.EoT).toBe(result2.EoT);
    expect(result1.B).toBe(result2.B);
    expect(result1.LSTM).toBe(result2.LSTM);
  });
});
