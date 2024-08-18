import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";

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
