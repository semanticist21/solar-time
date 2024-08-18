import dayjs from "dayjs";
import { Decimal } from "decimal.js";

/**
 * Calculate solar time for a specific date with high precision using Decimal.js
 * @param {Date} date - The date to calculate the solar time.
 * @param {string} longitude - The longitude of the location.
 * @param {Object} [options] - The options to calculate the solar time.
 * @param {number} [options.utc] - The UTC offset to use, defaults to the local UTC offset.
 * @returns {LST: Dayjs, TC: string, EoT: number, B: number, LSTM: number}
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

  return { LST: dayjs(date).add(TC.toNumber(), "minute"), TC: TC.toString(), EoT, B, LSTM };
};

/**
 * Calculate solar time for the current date with high precision using Decimal.js
 * @param {string} longitude - The longitude of the location.
 * @param {Object} [options] - The options to calculate the solar time.
 * @param {number} [options.utc] - The UTC offset to use, defaults to the local UTC offset.
 * @returns {LST: Dayjs, TC: string, EoT: number, B: number, LSTM: number}
 */
export const SolarNowPrecise = (longitude: string, options?: { utc: number }) => {
  return SolarPrecise(new Date(), longitude, options);
};
