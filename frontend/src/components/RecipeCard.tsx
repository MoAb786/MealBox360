import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { RecommendationItem } from '../types';
import { colors, radius, shadows, spacing } from '../theme/tokens';

interface RecipeCardProps {
  item: RecommendationItem;
  onPress: () => void;
  style?: ViewStyle;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ item, onPress, style }) => {
  const isCookNow = item.missing_ingredients.length === 0;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${isCookNow ? 'ready to cook' : `needs ${item.missing_ingredients.length} items`}`}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderEmoji}>🍳</Text>
          </View>
        )}
        <View
          style={[
            styles.badgePill,
            { backgroundColor: isCookNow ? colors.lime : '#FEF3C7' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isCookNow ? colors.forest : '#92400E' },
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
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.subtle,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#EAEFEA',
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
    backgroundColor: colors.mint,
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
    borderRadius: radius.pill,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  metaPill: {
    fontSize: 11,
    color: colors.muted,
    backgroundColor: colors.page,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    fontWeight: '500',
  },
  matchPill: {
    fontSize: 11,
    color: colors.forest,
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    fontWeight: '700',
  },
  reasonsContainer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  reasonText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  missingText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
