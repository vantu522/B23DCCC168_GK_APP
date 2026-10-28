import { FootballField } from '../types/field.types';
import { Booking } from '../types/booking.types';
import { getTodayFormatted, getFutureDateFormatted } from '../utils/date.utils';

export const INITIAL_FIELDS: FootballField[] = [
  {
    id: 'san-1',
    name: 'Sân A1',
    type: '5 người',
    pricePerHour: 200000,
    status: 'Hoạt động',
    description: 'Sân 5 tiêu chuẩn cỏ nhân tạo, hệ thống chiếu sáng LED',
  },
  {
    id: 'san-2',
    name: 'Sân A2',
    type: '5 người',
    pricePerHour: 220000,
    status: 'Hoạt động',
    description: 'Sân 5 chất lượng cao, gần khu vực thay đồ và căng tin',
  },
  {
    id: 'san-3',
    name: 'Sân B1',
    type: '7 người',
    pricePerHour: 350000,
    status: 'Hoạt động',
    description: 'Sân 7 người mặt sân mới thay cỏ, hệ thống thoát nước chuẩn',
  },
  {
    id: 'san-4',
    name: 'Sân B2',
    type: '7 người',
    pricePerHour: 400000,
    status: 'Bảo trì',
    description: 'Sân 7 người đang bảo dưỡng bề mặt cỏ và thay lưới khung thành',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'dat-1',
    fieldId: 'san-1',
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    date: getTodayFormatted(),
    startHour: 17,
    hours: 2,
    status: 'Đã đặt',
  },
  {
    id: 'dat-2',
    fieldId: 'san-2',
    customerName: 'Trần Thị B',
    phone: '0987654321',
    date: getTodayFormatted(),
    startHour: 19,
    hours: 1,
    status: 'Đã đặt',
  },
  {
    id: 'dat-3',
    fieldId: 'san-3',
    customerName: 'Lê Văn C',
    phone: '0905123456',
    date: getFutureDateFormatted(1),
    startHour: 18,
    hours: 3,
    status: 'Đã đặt',
  },
];
