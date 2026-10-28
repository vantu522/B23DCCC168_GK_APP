import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { FieldStatus, FieldType } from '../../../types/field.types';
import { fieldService } from '../../../services/field.service';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { formatNumberWithDots, parseNumberFromDots } from '../../../utils/date.utils';
import { isNotEmpty, isValidPrice } from '../../../utils/validators';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldForm'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'FieldForm'>;

const FIELD_TYPES: FieldType[] = ['5 người', '7 người'];
const FIELD_STATUSES: FieldStatus[] = ['Hoạt động', 'Bảo trì'];

export const FieldFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const fieldId = route.params?.fieldId;
  const isEditing = Boolean(fieldId);

  const [name, setName] = useState('');
  const [type, setType] = useState<FieldType>('5 người');
  const [pricePerHour, setPricePerHour] = useState('200.000');
  const [status, setStatus] = useState<FieldStatus>('Hoạt động');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const loadFieldData = useCallback(async (id: string) => {
    const field = await fieldService.getFieldById(id);
    if (field) {
      setName(field.name);
      setType(field.type);
      setPricePerHour(formatNumberWithDots(field.pricePerHour));
      setStatus(field.status);
      setDescription(field.description || '');
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Sửa thông tin sân' : 'Thêm sân bóng mới',
    });

    if (fieldId) {
      loadFieldData(fieldId);
    }
  }, [fieldId, isEditing, navigation, loadFieldData]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) setNameError('');
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatNumberWithDots(text);
    setPricePerHour(formatted);
    if (priceError) setPriceError('');
  };

  const handleSave = async () => {
    let hasError = false;

    const trimmedName = name.trim();
    if (!isNotEmpty(trimmedName)) {
      setNameError('Tên sân không được để trống.');
      hasError = true;
    } else {
      const isDuplicate = await fieldService.isNameDuplicate(trimmedName, fieldId);
      if (isDuplicate) {
        setNameError(`Tên "${trimmedName}" đã tồn tại. Tên sân không được trùng nhau.`);
        hasError = true;
      } else {
        setNameError('');
      }
    }

    const priceNum = parseNumberFromDots(pricePerHour);
    if (!pricePerHour || pricePerHour.trim() === '') {
      setPriceError('Vui lòng nhập giá thuê mỗi giờ.');
      hasError = true;
    } else if (!isValidPrice(priceNum)) {
      setPriceError('Giá thuê phải là số lớn hơn 0.');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (hasError) return;

    try {
      setSaving(true);
      if (isEditing && fieldId) {
        await fieldService.updateField(fieldId, {
          name: trimmedName,
          type,
          pricePerHour: priceNum,
          status,
          description: description.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật sân bóng thành công.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await fieldService.createField({
          name: trimmedName,
          type,
          pricePerHour: priceNum,
          status,
          description: description.trim(),
        });
        Alert.alert('Thành công', 'Đã thêm sân mới thành công.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: isKeyboardVisible
                ? Math.max(keyboardHeight, 260) + spacing.lg
                : spacing.xxl + 20,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Tên sân (*)</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="Ví dụ: Sân A1, Sân A2..."
            placeholderTextColor={colors.textMuted}
            keyboardType="default"
            autoCapitalize="words"
            value={name}
            onChangeText={handleNameChange}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <Text style={styles.label}>Loại sân (*)</Text>
          <View style={styles.badgeRow}>
            {FIELD_TYPES.map(t => {
              const isSelected = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.badgeBtn,
                    isSelected ? styles.typeBadgeActive : styles.typeBadgeInactive,
                  ]}
                  onPress={() => setType(t)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.badgeBtnText,
                      isSelected ? styles.typeBadgeTextActive : styles.typeBadgeTextInactive,
                    ]}
                  >
                    Sân {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Giá thuê mỗi giờ (VNĐ, &gt; 0) (*)</Text>
          <TextInput
            style={[styles.input, priceError ? styles.inputError : null]}
            placeholder="Ví dụ: 300.000"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={pricePerHour}
            onChangeText={handlePriceChange}
          />
          {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

          <Text style={styles.label}>Trạng thái (*)</Text>
          <View style={styles.badgeRow}>
            {FIELD_STATUSES.map(s => {
              const isSelected = status === s;
              const isAct = s === 'Hoạt động';

              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusBadgeBtn,
                    isAct
                      ? isSelected
                        ? styles.badgeActiveSelected
                        : styles.badgeActiveUnselected
                      : isSelected
                      ? styles.badgeMaintenanceSelected
                      : styles.badgeMaintenanceUnselected,
                  ]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isAct
                        ? isSelected
                          ? styles.badgeTextSelected
                          : styles.badgeActiveTextUnselected
                        : isSelected
                        ? styles.badgeTextSelected
                        : styles.badgeMaintenanceTextUnselected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Mô tả thêm (tuỳ chọn)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Loại cỏ nhân tạo, đèn chiếu sáng..."
            placeholderTextColor={colors.textMuted}
            keyboardType="default"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            onFocus={handleDescriptionFocus}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {saving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm sân bóng'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorInputBg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
    fontWeight: typography.fontWeights.medium,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  badgeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  typeBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  typeBadgeInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  badgeBtnText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  typeBadgeTextActive: {
    color: colors.surface,
    fontWeight: typography.fontWeights.bold,
  },
  typeBadgeTextInactive: {
    color: colors.textSecondary,
  },
  statusBadgeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
  },
  badgeActiveSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  badgeActiveUnselected: {
    backgroundColor: colors.summaryBg,
    borderColor: colors.summaryBorder,
  },
  badgeMaintenanceSelected: {
    backgroundColor: colors.statusMaintenanceBg,
    borderColor: colors.statusMaintenanceBorder,
  },
  badgeMaintenanceUnselected: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  badgeTextSelected: {
    color: colors.surface,
  },
  badgeActiveTextUnselected: {
    color: colors.badgeActiveText,
  },
  badgeMaintenanceTextUnselected: {
    color: colors.badgeMaintenanceText,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnText: {
    color: colors.surface,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
