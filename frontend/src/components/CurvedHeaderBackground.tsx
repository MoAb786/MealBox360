import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '../theme/tokens';

interface Props {
  height?: number | string;
  curveRadius?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CurvedHeaderBackground: React.FC<Props> = ({
  height,
  curveRadius = radius.xxl,
  children,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          borderBottomLeftRadius: curveRadius,
          borderBottomRightRadius: curveRadius,
        },
        height !== undefined ? { height: height as any } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.forest,
    overflow: 'hidden',
    width: '100%',
  },
});
