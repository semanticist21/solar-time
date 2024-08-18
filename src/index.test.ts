import { test, expect } from "@jest/globals";
import { SolarNow, SolarNowPrecise } from "./index";
import dayjs from "dayjs";

test("query key test - chain:actions > params", () => {
  const solar1 = SolarNow(150);
  const solar2 = SolarNowPrecise("150");

  expect(dayjs(solar1.LST).isSame(dayjs(solar2.LST), "second")).toBe(true);
});
