import { format } from 'date-fns';

export const formatKRTime = () => {
  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return format(new Date(utc + 9 * 60 * 60 * 1000), 'yyyy-MM-dd HH:mm:ss');
};
