import { Booking } from '../types/booking.types';

export const hasBookingConflict = (
  existingBookings: Booking[],
  fieldId: string,
  date: string,
  startHour: number,
  hours: number,
  excludeBookingId?: string
): boolean => {
  const newEndHour = startHour + hours;

  return existingBookings.some(booking => {
    if (booking.id === excludeBookingId) return false;
    if (booking.fieldId !== fieldId) return false;
    if (booking.date !== date) return false;
    if (booking.status === 'Đã hủy') return false;

    const existingStart = booking.startHour;
    const existingEnd = booking.startHour + booking.hours;

    return startHour < existingEnd && existingStart < newEndHour;
  });
};

export const calculateBookingPrice = (hours: number, pricePerHour: number): number => {
  return hours * pricePerHour;
};
