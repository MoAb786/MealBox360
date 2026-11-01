import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../theme/tokens';
import { QuantityStepper } from './QuantityStepper';

interface IngredientCardProps {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  quantityInPantry?: number;
  image?: string;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  style?: ViewStyle;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  name,
  unit = '1 pc',
  quantityInPantry = 0,
  image,
  onPress,
  onIncrement,
  onDecrement,
  style,
}) => {
  const hasInPantry = quantityInPantry > 0;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${hasInPantry ? `${quantityInPantry} in pantry` : 'not in pantry'}`}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderIcon}>🥗</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.unitText} numberOfLines={1}>
          {hasInPantry ? `In pantry: ${quantityInPantry}` : unit}
        </Text>

        <View style={styles.stepperContainer}>
          <QuantityStepper
            quantity={quantityInPantry}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    width: 140,
    marginRight: 12,
    ...shadows.subtle,
  },
  imageContainer: {
    width: '100%',
    height: 95,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#F1F5F2',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.limeSoft,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    minHeight: 34,
    lineHeight: 17,
  },
  unitText: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 8,
    fontWeight: '500',
  },
  stepperContainer: {
    marginTop: 'auto',
  },
});
