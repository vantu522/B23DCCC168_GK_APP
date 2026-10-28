import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../theme/colors';

interface TrashIconProps {
  size?: number;
  color?: string;
}

export const TrashIcon: React.FC<TrashIconProps> = ({
  size = 18,
  color = colors.danger,
}) => {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size * 1.15 },
      ]}
    >
      <View
        style={[
          styles.lidTop,
          { width: size * 0.35, backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.lidRim,
          { width: size * 0.9, backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.canBody,
          {
            width: size * 0.7,
            height: size * 0.75,
            borderColor: color,
          },
        ]}
      >
        <View style={[styles.canLine, { backgroundColor: color }]} />
        <View style={[styles.canLine, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lidTop: {
    height: 2,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  lidRim: {
    height: 2,
    borderRadius: 1,
    marginVertical: 1,
  },
  canBody: {
    borderWidth: 1.6,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  canLine: {
    width: 1.2,
    height: '60%',
    borderRadius: 1,
  },
});
