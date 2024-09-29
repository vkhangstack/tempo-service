import dayjs from 'dayjs';

export const dateToTimestamps = (value: string | Date) => {
  return dayjs(value).unix() * 100;
};

export const formatDate = (value: string | Date) => {
  return dayjs(value).format('YYYY-MM-DD');
};
