import { storageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { INITIAL_BOOKINGS } from '../constants/initialData';
import { Booking, CreateBookingDTO, UpdateBookingDTO } from '../types/booking.types';
import { hasBookingConflict } from '../utils/booking.utils';
import { formatTimeSlot } from '../utils/date.utils';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    const bookings = await storageService.getItem<Booking[]>(STORAGE_KEYS.BOOKINGS);
    if (bookings === null) {
      await storageService.setItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
      return INITIAL_BOOKINGS;
    }
    return bookings;
  },

  async getBookingsByFieldId(fieldId: string): Promise<Booking[]> {
    const bookings = await this.getBookings();
    return bookings.filter(b => b.fieldId === fieldId);
  },

  async getActiveBookingsByFieldId(fieldId: string): Promise<Booking[]> {
    const bookings = await this.getBookingsByFieldId(fieldId);
    return bookings.filter(b => b.status !== 'Đã hủy');
  },

  async createBooking(dto: CreateBookingDTO): Promise<Booking> {
    const bookings = await this.getBookings();

    if (dto.startHour + dto.hours > 23) {
      throw new Error(
        `Giờ kết thúc (${dto.startHour + dto.hours}:00) không được quá 23h.`
      );
    }

    const isConflict = hasBookingConflict(
      bookings,
      dto.fieldId,
      dto.date,
      dto.startHour,
      dto.hours
    );

    if (isConflict) {
      throw new Error(
        `Trùng lịch đặt: Khung giờ ${formatTimeSlot(dto.startHour, dto.hours)} ngày ${dto.date} đã có lượt đặt trước trên sân này.`
      );
    }

    const newBooking: Booking = {
      ...dto,
      status: dto.status || 'Đã đặt',
      id: 'dat_' + Date.now(),
    };
    const updated = [newBooking, ...bookings];
    await storageService.setItem(STORAGE_KEYS.BOOKINGS, updated);
    return newBooking;
  },

  async cancelBooking(id: string): Promise<Booking | null> {
    const bookings = await this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updatedBooking: Booking = {
      ...bookings[index],
      status: 'Đã hủy',
    };
    bookings[index] = updatedBooking;
    await storageService.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return updatedBooking;
  },

  async updateBooking(id: string, dto: UpdateBookingDTO): Promise<Booking> {
    const bookings = await this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy lượt đặt sân');
    }

    const current = bookings[index];
    const fieldId = dto.fieldId || current.fieldId;
    const date = dto.date || current.date;
    const startHour = dto.startHour !== undefined ? dto.startHour : current.startHour;
    const hours = dto.hours !== undefined ? dto.hours : current.hours;

    if (startHour + hours > 23) {
      throw new Error(
        `Giờ kết thúc (${startHour + hours}:00) không được quá 23h.`
      );
    }

    const isConflict = hasBookingConflict(bookings, fieldId, date, startHour, hours, id);
    if (isConflict) {
      throw new Error(
        `Trùng lịch đặt: Khung giờ ${formatTimeSlot(startHour, hours)} ngày ${date} đã bị trùng.`
      );
    }

    const updatedBooking: Booking = {
      ...current,
      ...dto,
    };
    bookings[index] = updatedBooking;
    await storageService.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return updatedBooking;
  },

  async deleteBooking(id: string): Promise<boolean> {
    const bookings = await this.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    await storageService.setItem(STORAGE_KEYS.BOOKINGS, filtered);
    return true;
  },

  async resetDefault(): Promise<Booking[]> {
    await storageService.setItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return INITIAL_BOOKINGS;
  },
};
