export const formatPricePerHour = (price: number): string => {
  if (typeof price !== 'number' || isNaN(price)) return '0 đ/giờ';
  const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} đ/giờ`;
};

export const formatNumberWithDots = (value: string | number): string => {
  if (value === undefined || value === null) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumberFromDots = (value: string): number => {
  if (!value) return 0;
  const clean = value.toString().replace(/\./g, '').trim();
  const num = Number(clean);
  return isNaN(num) ? 0 : num;
};

export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 đ';
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} đ`;
};

export const getTodayFormatted = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getFutureDateFormatted = (daysToAdd: number): string => {
  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);
  const day = String(target.getDate()).padStart(2, '0');
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const year = target.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTimeSlot = (startHour: number, hours: number): string => {
  const endHour = startHour + hours;
  const formatH = (h: number) => `${String(h).padStart(2, '0')}:00`;
  return `${formatH(startHour)} - ${formatH(endHour)}`;
};

export const formatDateInput = (input: string, prevDate: string = ''): string => {
  if (input.length < prevDate.length) {
    if (prevDate.endsWith('/') && input === prevDate.slice(0, -1)) {
      return input.slice(0, -1);
    }
    return input;
  }

  const rawDigits = input.replace(/\D/g, '');
  if (input.endsWith('/') && rawDigits.length === 1) {
    return `0${rawDigits}/`;
  }
  if (input.endsWith('/') && rawDigits.length === 3) {
    return `${rawDigits.slice(0, 2)}/0${rawDigits.slice(2, 3)}/`;
  }

  const digits = rawDigits.slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) {
    return digits.length === 2 ? `${digits}/` : digits;
  }
  if (digits.length <= 4) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2);
    return digits.length === 4 ? `${day}/${month}/` : `${day}/${month}`;
  }

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `${day}/${month}/${year}`;
};
