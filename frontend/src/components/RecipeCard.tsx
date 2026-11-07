import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { RecommendationItem } from '../types';
import { colors, radius, shadows, spacing } from '../theme/tokens';
import { getRecipeImageUrl } from '../data/recipeImages';

interface RecipeCardProps {
  item: RecommendationItem;
  onPress: () => void;
  style?: ViewStyle;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ item, onPress, style }) => {
  const [imageError, setImageError] = useState(false);
  const isCookNow = item.missing_ingredients.length === 0;
  const imageUrl = getRecipeImageUrl(item);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${isCookNow ? 'ready to cook' : `needs ${item.missing_ingredients.length} items`}`}
    >
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderEmoji}>🍳</Text>
          </View>
        )}
        <View
          style={[
            styles.badgePill,
            { backgroundColor: isCookNow ? colors.accent : 'rgba(232,193,50,0.25)' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isCookNow ? colors.textPrimary : '#7A5A00' },
            ]}
          >
            {isCookNow ? '✓ Cook Now' : `Needs ${item.missing_ingredients.length}`}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {item.cuisine ? <Text style={styles.metaPill}>🏷️ {item.cuisine}</Text> : null}
          {item.total_time_minutes ? (
            <Text style={styles.metaPill}>⏱️ {item.total_time_minutes}m</Text>
          ) : null}
          <Text style={styles.matchPill}>
            {item.matched_count}/{item.required_count} ({item.match_percent}%)
          </Text>
        </View>

        {item.recommendation_reasons && item.recommendation_reasons.length > 0 ? (
          <View style={styles.reasonsContainer}>
            {item.recommendation_reasons.slice(0, 1).map((reason, idx) => (
              <Text key={idx} style={styles.reasonText} numberOfLines={1}>
                ✨ {reason}
              </Text>
            ))}
          </View>
        ) : null}

        {item.missing_ingredients && item.missing_ingredients.length > 0 ? (
          <Text style={styles.missingText} numberOfLines={1}>
            Need: {item.missing_ingredients.slice(0, 3).join(', ')}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,           // 18px per design system
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 148,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  badgePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  metaPill: {
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    fontWeight: '500',
  },
  matchPill: {
    fontSize: 11,
    color: colors.primary,
    backgroundColor: 'rgba(74,107,58,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    fontWeight: '700',
  },
  reasonsContainer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 6,
  },
  reasonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  missingText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
