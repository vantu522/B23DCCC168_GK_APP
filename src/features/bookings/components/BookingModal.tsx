import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateBookingDTO } from '../../../types/booking.types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { formatCurrency, formatDateInput, formatTimeSlot, getTodayFormatted } from '../../../utils/date.utils';
import {
  isNotEmpty,
  isValidDateFormat,
  isValidPhoneNumber,
  isValidRentHours,
  isValidStartHour,
} from '../../../utils/validators';

interface BookingModalProps {
  visible: boolean;
  fieldId: string;
  fieldName: string;
  pricePerHour: number;
  onClose: () => void;
  onSubmit: (bookingData: CreateBookingDTO) => Promise<void>;
}

const HOUR_PRESETS = [1, 2, 3];

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  fieldId,
  fieldName,
  pricePerHour,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(getTodayFormatted());
  const [startHourText, setStartHourText] = useState('17');
  const [hoursText, setHoursText] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text, date);
    setDate(formatted);
  };

  const startHour = Number(startHourText);
  const hours = Number(hoursText);
  const isStartHourValid = isValidStartHour(startHour);
  const isHoursValid = isValidRentHours(hours);

  const totalPrice = isHoursValid ? pricePerHour * hours : 0;

  const handleSubmit = async () => {
    if (!isNotEmpty(customerName)) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng nhập tên khách đặt sân.');
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      Alert.alert(
        'Lỗi nhập liệu',
        'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (VD: 0912345678).'
      );
      return;
    }

    if (!isValidDateFormat(date)) {
      Alert.alert(
        'Lỗi nhập liệu',
        'Ngày đặt sân phải đúng định dạng dd/mm/yyyy (VD: 28/10/2026).'
      );
      return;
    }

    if (!isStartHourValid) {
      Alert.alert(
        'Lỗi nhập liệu',
        'Giờ bắt đầu phải là số nguyên từ 6 đến 22 (tương đương 6h sáng đến 22h tối).'
      );
      return;
    }

    if (!isHoursValid) {
      Alert.alert('Lỗi nhập liệu', 'Số giờ thuê phải từ 1 đến 3 giờ.');
      return;
    }

    if (startHour + hours > 23) {
      Alert.alert(
        'Khung giờ không hợp lệ',
        `Giờ kết thúc (${startHour + hours}:00) không được quá 23h.`
      );
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        fieldId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        date: date.trim(),
        startHour,
        hours,
      });

      setCustomerName('');
      setPhone('');
      setDate(getTodayFormatted());
      setStartHourText('17');
      setHoursText('2');
      onClose();
    } catch (error: any) {
      Alert.alert('Không thể đặt sân', error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
            <Text style={styles.title}>Đặt sân: {fieldName}</Text>

            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
            >
              <Text style={styles.label}>Tên khách (*)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Nguyễn Văn A"
                placeholderTextColor={colors.textMuted}
                keyboardType="default"
                autoCapitalize="words"
                value={customerName}
                onChangeText={setCustomerName}
              />

              <Text style={styles.label}>Số điện thoại (*)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 0912345678"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.label}>Ngày đặt sân (dd/mm/yyyy) (*)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 28/10/2026"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
                value={date}
                onChangeText={handleDateChange}
              />

              <Text style={styles.label}>Giờ bắt đầu (* từ 6 đến 22)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 17 (nghĩa là 17:00)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={startHourText}
                onChangeText={setStartHourText}
              />

              <Text style={styles.label}>Số giờ thuê (* từ 1 đến 3 giờ)</Text>
              <View style={styles.hoursInputRow}>
                <TextInput
                  style={[styles.input, styles.hoursInput]}
                  placeholder="VD: 2"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={1}
                  value={hoursText}
                  onChangeText={setHoursText}
                />
                <View style={styles.presetRow}>
                  {HOUR_PRESETS.map(preset => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.presetChip,
                        hoursText === preset.toString() && styles.presetChipActive,
                      ]}
                      onPress={() => setHoursText(preset.toString())}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          hoursText === preset.toString() && styles.presetChipTextActive,
                        ]}
                      >
                        {preset} giờ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceFormula}>
                    Giá thuê: {formatCurrency(pricePerHour)}/giờ
                  </Text>
                  {isStartHourValid && isHoursValid && (
                    <Text style={styles.timeSlotText}>
                      Khung giờ: {formatTimeSlot(startHour, hours)}
                    </Text>
                  )}
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Thành tiền:</Text>
                  <Text style={styles.totalAmount}>
                    {isHoursValid
                      ? `${formatCurrency(totalPrice)}`
                      : 'Chưa hợp lệ'}
                  </Text>
                </View>

                {isHoursValid && (
                  <Text style={styles.calculationDetail}>
                    ({formatCurrency(pricePerHour)} × {hours} giờ)
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.submitBtn]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Đang lưu...' : 'Xác nhận đặt'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '92%',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    maxHeight: '100%',
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  hoursInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hoursInput: {
    width: 60,
    textAlign: 'center',
    fontWeight: typography.fontWeights.bold,
  },
  presetRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  presetChipTextActive: {
    color: colors.surface,
    fontWeight: typography.fontWeights.bold,
  },
  priceCard: {
    backgroundColor: colors.summaryBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.summaryBorder,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceFormula: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  timeSlotText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.bold,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  totalAmount: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  calculationDetail: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semiBold,
  },
  submitBtn: {
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    color: colors.surface,
    fontWeight: typography.fontWeights.bold,
  },
});
