import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Booking } from '../../../types/booking.types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { formatCurrency, formatTimeSlot } from '../../../utils/date.utils';
import { calculateBookingPrice } from '../../../utils/booking.utils';

interface BookingCardProps {
  booking: Booking;
  pricePerHour?: number;
  fieldName?: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  pricePerHour,
  fieldName,
  onPress,
  onDelete,
}) => {
  const isCancelled = booking.status === 'Đã hủy';
  const totalPrice = pricePerHour
    ? calculateBookingPrice(booking.hours, pricePerHour)
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, isCancelled && styles.cardCancelled]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.nameAndBadge}>
          <Text style={[styles.customerName, isCancelled && styles.textMuted]}>
            Khách hàng: {booking.customerName}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isCancelled ? styles.statusCancelledBadge : styles.statusActiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isCancelled ? styles.statusCancelledText : styles.statusActiveText,
              ]}
            >
              {booking.status || 'Đã đặt'}
            </Text>
          </View>
        </View>

        {!isCancelled && onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteBtnText}>Hủy đặt</Text>
          </TouchableOpacity>
        )}
      </View>

      {fieldName ? <Text style={styles.fieldName}>Sân: {fieldName}</Text> : null}

      <View style={styles.infoRow}>
        <Text style={[styles.infoText, isCancelled && styles.textMuted]}>
          SĐT: {booking.phone}
        </Text>
        <Text style={[styles.infoText, isCancelled && styles.textMuted]}>
          Ngày: {booking.date}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.timeSlotText, isCancelled && styles.textMuted]}>
          Giờ đá: {formatTimeSlot(booking.startHour, booking.hours)} ({booking.hours} giờ)
        </Text>
        {totalPrice !== null && (
          <Text style={[styles.priceText, isCancelled && styles.priceCancelled]}>
            {formatCurrency(totalPrice)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCancelled: {
    backgroundColor: colors.cardMutedBg,
    borderColor: colors.cardMutedBorder,
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
    gap: spacing.xs,
  },
  customerName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  textMuted: {
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusActiveBadge: {
    backgroundColor: colors.badgeActiveSoftBg,
  },
  statusActiveText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.badgeActiveText,
  },
  statusCancelledBadge: {
    backgroundColor: colors.dangerLight,
  },
  statusCancelledText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.danger,
  },
  statusBadgeText: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  deleteBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  deleteBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    fontWeight: typography.fontWeights.bold,
  },
  fieldName: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  timeSlotText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semiBold,
  },
  priceText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.error,
  },
  priceCancelled: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
