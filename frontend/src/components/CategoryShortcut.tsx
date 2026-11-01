import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

interface CategoryShortcutProps {
  label: string;
  icon: string;
  bgColor?: string;
  onPress: () => void;
  selected?: boolean;
}

export const CategoryShortcut: React.FC<CategoryShortcutProps> = ({
  label,
  icon,
  bgColor = colors.pastels.all,
  onPress,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Category ${label}`}
    >
      <View
        style={[
          styles.circle,
          { backgroundColor: bgColor },
          selected && styles.circleSelected,
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 64,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  circleSelected: {
    borderColor: colors.forest,
  },
  icon: {
    fontSize: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.forest,
    fontWeight: '800',
  },
});
