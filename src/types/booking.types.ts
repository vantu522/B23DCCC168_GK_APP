export type BookingStatus = 'Đã đặt' | 'Đã hủy';

export interface Booking {
  id: string;
  fieldId: string;
  customerName: string;
  phone: string;
  date: string;
  startHour: number;
  hours: number;
  status?: BookingStatus;
}

export type CreateBookingDTO = Omit<Booking, 'id'>;

export type UpdateBookingDTO = Partial<CreateBookingDTO>;
