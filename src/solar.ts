import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";

// plugins
dayjs.extend(dayOfYear);

/**
 * Calculate solar time for a specific date
 * @param {Date} date - The date to calculate the solar time.
 * @param {number} longitude - The longitude of the location.
 * @param {Object} [options] - The options to calculate the solar time.
 * @param {number} [options.utc] - The UTC offset to use, defaults to the local UTC offset.
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

  // Spencer's Equation for improved accuracy (±30 seconds vs ±2 minutes)
  const EoT = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(B_rad) -
    0.032077 * Math.sin(B_rad) -
    0.014615 * Math.cos(2 * B_rad) -
    0.040849 * Math.sin(2 * B_rad)
  );

  const TC = 4 * (longitude - LSTM) + EoT;

  return { LST: dayjs(date).add(TC, "minute"), TC, EoT, B, LSTM };
};

/**
 * Calculate solar time for the current date
 * @param {number} longitude - The longitude of the location.
 * @param {Object} [options] - The options to calculate the solar time.
 * @param {number} [options.utc] - The UTC offset to use, defaults to the local UTC offset.
 */
export const SolarNow = (longitude: number, options?: { utc: number }) => {
  return Solar(new Date(), longitude, options);
};
