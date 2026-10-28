import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FootballField } from '../../../types/field.types';
import { fieldService } from '../../../services/field.service';
import { bookingService } from '../../../services/booking.service';
import { FieldCard } from '../components/FieldCard';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldList'>;

export const FieldListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [fields, setFields] = useState<FootballField[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFields = useCallback(async () => {
    try {
      const data = await fieldService.getFields();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFields();
    }, [loadFields])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFields();
  };

  const handleDeleteField = async (field: FootballField) => {
    try {
      const fieldBookings = await bookingService.getBookingsByFieldId(field.id);
      const activeBookings = fieldBookings.filter(b => b.status !== 'Đã hủy');
      if (activeBookings.length > 0) {
        Alert.alert(
          'Không thể xóa',
          `Sân "${field.name}" hiện đang có ${activeBookings.length} lượt đặt còn hiệu lực, không thể xóa.`
        );
        return;
      }

      Alert.alert(
        'Xác nhận xóa sân',
        `Bạn có chắc chắn muốn xóa sân "${field.name}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              await fieldService.deleteField(field.id);
              await loadFields();
              Alert.alert('Thành công', `Đã xóa sân "${field.name}".`);
            },
          },
        ]
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác xóa sân.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Khôi phục dữ liệu',
      'Bạn có muốn đặt lại 4 sân và 3 lượt đặt mẫu mặc định?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            await fieldService.resetDefault();
            await bookingService.resetDefault();
            loadFields();
            Alert.alert('Thông báo', 'Đã khôi phục dữ liệu mẫu thành công.');
          },
        },
      ]
    );
  };

  const activeCount = fields.filter(f => f.status === 'Hoạt động').length;
  const totalCount = fields.length;

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {activeCount}/{totalCount} sân hoạt động
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <Text style={styles.textButtonLabel}>Dữ liệu mẫu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('FieldForm', {})}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonLabel}>+ Thêm sân</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách sân...</Text>
        </View>
      ) : (
        <FlatList
          data={fields}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <FieldCard
              field={item}
              onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
              onDelete={() => handleDeleteField(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có sân bóng nào.</Text>
              <Text style={styles.emptySubText}>
                Bấm "Thêm sân" hoặc "Dữ liệu mẫu" để tạo sân.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBanner: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: colors.summaryBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.statusActiveBorder,
  },
  statsText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.badgeActiveText,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  textButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textButtonLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  addButtonLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.surface,
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
