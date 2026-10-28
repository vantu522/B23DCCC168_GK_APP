import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FieldListScreen } from '../features/fields/screens/FieldListScreen';
import { FieldDetailScreen } from '../features/fields/screens/FieldDetailScreen';
import { FieldFormScreen } from '../features/fields/screens/FieldFormScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  FieldList: undefined;
  FieldDetail: { fieldId: string };
  FieldForm: { fieldId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="FieldList"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="FieldList"
        component={FieldListScreen}
        options={{
          title: 'Quản Lý Sân Bóng',
        }}
      />
      <Stack.Screen
        name="FieldDetail"
        component={FieldDetailScreen}
        options={{
          title: 'Chi tiết sân',
        }}
      />
      <Stack.Screen
        name="FieldForm"
        component={FieldFormScreen}
        options={{
          title: 'Sân bóng',
        }}
      />
    </Stack.Navigator>
  );
};
