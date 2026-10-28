import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FootballField } from '../../../types/field.types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { formatPricePerHour } from '../../../utils/date.utils';
import { TrashIcon } from './TrashIcon';

interface FieldCardProps {
  field: FootballField;
  onPress: () => void;
  onDelete?: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onPress, onDelete }) => {
  const isAvailable = field.status === 'Hoạt động';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentColumn}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {field.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isAvailable ? styles.statusActiveBadge : styles.statusMaintenanceBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isAvailable ? styles.statusActiveText : styles.statusMaintenanceText,
              ]}
            >
              {field.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Loại sân: </Text>
          <Text style={styles.valueText}>{field.type}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Giá thuê: </Text>
          <Text style={styles.priceValue}>{formatPricePerHour(field.pricePerHour)}</Text>
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={e => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
        >
          <TrashIcon size={18} color={colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  contentColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginRight: spacing.sm,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
  },
  statusActiveBadge: {
    backgroundColor: colors.badgeActiveBg,
    borderColor: colors.badgeActiveBorder,
  },
  statusMaintenanceBadge: {
    backgroundColor: colors.badgeMaintenanceBg,
    borderColor: colors.badgeMaintenanceBorder,
  },
  statusText: {
    fontSize: typography.fontSizes.badge,
    fontWeight: typography.fontWeights.semiBold,
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: typography.lineHeights.badge,
  },
  statusActiveText: {
    color: colors.badgeActiveText,
  },
  statusMaintenanceText: {
    color: colors.badgeMaintenanceText,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  valueText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  priceValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
});
