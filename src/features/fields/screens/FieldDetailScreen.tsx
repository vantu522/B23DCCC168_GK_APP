import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FootballField } from '../../../types/field.types';
import { Booking, CreateBookingDTO } from '../../../types/booking.types';
import { fieldService } from '../../../services/field.service';
import { bookingService } from '../../../services/booking.service';
import { BookingCard } from '../../bookings/components/BookingCard';
import { BookingModal } from '../../bookings/components/BookingModal';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { formatPricePerHour, formatTimeSlot } from '../../../utils/date.utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldDetail'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'FieldDetail'>;

export const FieldDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { fieldId } = route.params;

  const [field, setField] = useState<FootballField | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const fieldData = await fieldService.getFieldById(fieldId);
      const bookingData = await bookingService.getBookingsByFieldId(fieldId);
      setField(fieldData);
      setBookings(bookingData);
      if (fieldData) {
        navigation.setOptions({ title: fieldData.name });
      }
    } catch (error) {
      console.error('Error loading field details:', error);
    } finally {
      setLoading(false);
    }
  }, [fieldId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteField = () => {
    const activeBookings = bookings.filter(b => b.status !== 'Đã hủy');
    if (activeBookings.length > 0) {
      Alert.alert(
        'Không thể xóa',
        `Sân "${field?.name}" hiện đang có ${activeBookings.length} lượt đặt còn hiệu lực, không thể xóa.`
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa sân',
      `Bạn có chắc chắn muốn xóa sân "${field?.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await fieldService.deleteField(fieldId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Xác nhận hủy đặt sân',
      `Bạn có chắc chắn muốn hủy lượt đặt của khách "${booking.customerName}" (${formatTimeSlot(booking.startHour, booking.hours)} ngày ${booking.date}) không?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt sân',
          style: 'destructive',
          onPress: async () => {
            await bookingService.cancelBooking(booking.id);
            await loadData();
            Alert.alert('Thành công', 'Đã hủy lượt đặt sân. Trạng thái chuyển thành "Đã hủy".');
          },
        },
      ]
    );
  };

  const handleCreateBooking = async (dto: CreateBookingDTO) => {
    await bookingService.createBooking(dto);
    Alert.alert('Thông báo', 'Đã đặt sân thành công.');
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!field) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin sân bóng.</Text>
      </View>
    );
  }

  const isAvailable = field.status === 'Hoạt động';

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            pricePerHour={field.pricePerHour}
            onDelete={() => handleCancelBooking(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <View style={styles.nameRow}>
              <Text style={styles.fieldName}>{field.name}</Text>
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

            <Text style={styles.typeText}>Loại: Sân {field.type}</Text>
            <Text style={styles.priceText}>
              Giá thuê: {formatPricePerHour(field.pricePerHour)}
            </Text>

            {field.description ? (
              <Text style={styles.description}>{field.description}</Text>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => navigation.navigate('FieldForm', { fieldId: field.id })}
              >
                <Text style={styles.editBtnText}>Sửa thông tin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDeleteField}
              >
                <Text style={styles.deleteBtnText}>Xóa sân</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>
                Danh sách lượt đặt ({bookings.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có lượt đặt nào cho sân này.</Text>
            <Text style={styles.emptySubText}>
              {isAvailable
                ? 'Bấm nút "Đặt sân" bên dưới để tạo lượt đặt mới.'
                : 'Sân đang bảo trì, không thể tạo lượt đặt.'}
            </Text>
          </View>
        }
      />

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TouchableOpacity
          style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={!isAvailable}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookBtnText, !isAvailable && styles.bookBtnDisabledText]}>
            {isAvailable ? 'Đặt sân' : 'Đặt sân (Sân đang bảo trì)'}
          </Text>
        </TouchableOpacity>
      </View>

      <BookingModal
        visible={modalVisible}
        fieldId={field.id}
        fieldName={field.name}
        pricePerHour={field.pricePerHour}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateBooking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  headerCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldName: {
    fontSize: typography.fontSizes.xl,
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
  typeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semiBold,
    marginBottom: spacing.xs,
  },
  priceText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: typography.lineHeights.md,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    color: colors.text,
    fontWeight: typography.fontWeights.semiBold,
    fontSize: typography.fontSizes.sm,
  },
  deleteBtn: {
    backgroundColor: colors.dangerBgLight,
  },
  deleteBtnText: {
    color: colors.error,
    fontWeight: typography.fontWeights.semiBold,
    fontSize: typography.fontSizes.sm,
  },
  sectionDivider: {
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: colors.inputDisabledBg,
    borderWidth: 1,
    borderColor: colors.inputDisabledBorder,
  },
  bookBtnText: {
    color: colors.surface,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  bookBtnDisabledText: {
    color: colors.textDisabled,
  },
});
