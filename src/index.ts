import dayjs from "dayjs";

export const calculateSolarTime = (
  date: Date,
  longitude: number,
  options?: {
    utc: number;
  }
) => {
  // get UTC from date
  const utc = options?.utc ?? dayjs(date).utcOffset() / 60;
  console.log(utc);
};

calculateSolarTime(new Date(), 139.76667);
