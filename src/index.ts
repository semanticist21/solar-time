import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import { Decimal } from "decimal.js";

// plugins
dayjs.extend(dayOfYear);

/**
 * Calculate solar time for a specific date
 * @param date - The date to calculate the solar time
 * @param longitude - The longitude of the location
 * @param options - The options to calculate the solar time
 * @returns {LST: Dayjs, TC: number, EoT: number, B: number, LSTM: number}

 */
export const Solar = (
  date: Date,
  longitude: number,
  options?: {
    utc: number;
  }
) => {
  // get UTC from date
  const utc = options?.utc ?? dayjs(date).utcOffset() / 60;

  const LSTM = 15 * Math.abs(utc);

  const B = (360 / 365) * (dayjs(date).dayOfYear() - 81);
  const B_rad = B * (Math.PI / 180);
  const EoT = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad);

  const TC = 4 * (longitude - LSTM) + EoT;

  return { LST: dayjs(date).add(TC, "minute"), TC, EoT, B, LSTM };
};

/**
 * Calculate solar time for the current date
 * @param longitude - The longitude of the location
 * @param options - The options to calculate the solar time
 * @returns {LST: Dayjs, TC: number, EoT: number, B: number, LSTM: number}
 */
export const SolarNow = (longitude: number, options?: { utc: number }) => {
  return Solar(new Date(), longitude, options);
};

/**
 * Calculate solar time for a specific date with high precision using Decimal.js
 * @param date - The date to calculate the solar time
 * @param longitude - The longitude of the location(string)
 * @param options - The options to calculate the solar time
 * @returns {LST: Dayjs, TC: number, EoT: number, B: number, LSTM: number}
 */
export const SolarPrecise = (
  date: Date,
  longitude: string,
  options?: {
    utc: number;
  }
) => {
  // get UTC from date
  const utc = options?.utc ?? new Decimal(dayjs(date).utcOffset()).div(60).toNumber();

  const LSTM = new Decimal(15).mul(new Decimal(Math.abs(utc)));

  const B = new Decimal(360).div(365).mul(new Decimal(dayjs(date).dayOfYear()).minus(81));
  const B_rad = B.mul(Math.PI).div(180);
  const EoT = new Decimal(9.87)
    .mul(B_rad.mul(2).sin())
    .minus(new Decimal(7.53).mul(B_rad.cos()))
    .minus(new Decimal(1.5).mul(B_rad.sin()));

  const TC = new Decimal(4).mul(new Decimal(longitude).minus(LSTM)).plus(EoT);

  return { LST: dayjs(date).add(TC.toNumber(), "minute"), TC, EoT, B, LSTM };
};

/**
 * Calculate solar time for the current date with high precision using Decimal.js
 * @param longitude - The longitude of the location(string)
 * @param options - The options to calculate the solar time
 * @returns {LST: Dayjs, TC: number, EoT: number, B: number, LSTM: number}
 */
export const SolarNowPrecise = (longitude: string, options?: { utc: number }) => {
  return SolarPrecise(new Date(), longitude, options);
};
