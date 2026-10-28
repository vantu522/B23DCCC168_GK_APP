export const isNotEmpty = (value?: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone.trim());
};

export const isValidDateFormat = (dateStr: string): boolean => {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!dateRegex.test(dateStr.trim())) return false;

  const [d, m, y] = dateStr.trim().split('/').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return (
    dateObj.getFullYear() === y &&
    dateObj.getMonth() === m - 1 &&
    dateObj.getDate() === d
  );
};

export const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && !isNaN(price) && price > 0;
};

export const isValidStartHour = (hour: number): boolean => {
  return Number.isInteger(hour) && hour >= 6 && hour <= 22;
};

export const isValidRentHours = (hours: number): boolean => {
  return Number.isInteger(hours) && hours >= 1 && hours <= 3;
};

export const isValidEndHour = (startHour: number, hours: number): boolean => {
  return startHour + hours <= 23;
};
