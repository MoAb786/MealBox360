import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/tokens';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  size?: 'small' | 'medium';
  style?: StyleProp<ViewStyle>;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  size = 'small',
  style,
}) => {
  const isSmall = size === 'small';

  // If at 0 and min is 0, show a single plus button pill
  if (quantity <= min && min === 0) {
    return (
      <TouchableOpacity
        onPress={onIncrement}
        style={[
          styles.addPill,
          isSmall ? styles.addPillSmall : styles.addPillMedium,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add to pantry"
        activeOpacity={0.8}
      >
        <Text style={[styles.plusText, isSmall ? styles.textSmall : styles.textMedium]}>+</Text>
      </TouchableOpacity>
    );
  }

  // Expanded stepper capsule
  return (
    <View
      style={[
        styles.stepperContainer,
        isSmall ? styles.stepperSmall : styles.stepperMedium,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onDecrement}
        style={styles.stepBtn}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        activeOpacity={0.7}
      >
        <Text style={[styles.stepIcon, isSmall ? styles.textSmall : styles.textMedium]}>−</Text>
      </TouchableOpacity>

      <Text style={[styles.qtyText, isSmall ? styles.qtySmall : styles.qtyMedium]}>
        {quantity}
      </Text>

      <TouchableOpacity
        onPress={onIncrement}
        style={styles.stepBtn}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        activeOpacity={0.7}
      >
        <Text style={[styles.stepIcon, isSmall ? styles.textSmall : styles.textMedium]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addPill: {
    backgroundColor: colors.primary,   // forest green
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPillSmall: {
    width: 32,
    height: 32,
  },
  addPillMedium: {
    paddingHorizontal: 16,
    height: 44,
  },
  plusText: {
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: 18,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  stepperSmall: {
    height: 32,
    paddingHorizontal: 4,
    minWidth: 84,
  },
  stepperMedium: {
    height: 44,
    paddingHorizontal: 8,
    minWidth: 110,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  textSmall: {
    fontSize: 16,
  },
  textMedium: {
    fontSize: 20,
  },
  qtyText: {
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  qtySmall: {
    fontSize: 13,
    minWidth: 20,
  },
  qtyMedium: {
    fontSize: 16,
    minWidth: 28,
  },
});
