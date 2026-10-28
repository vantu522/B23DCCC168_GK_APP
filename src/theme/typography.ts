import { TextStyle } from 'react-native';

export const typography = {
  fontSizes: {
    caption: 10,
    badge: 11,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  fontWeights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
  lineHeights: {
    badge: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
  },
};

export type Typography = typeof typography;
