import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { RecommendationItem } from '../types';

interface RecipeCardProps {
  item: RecommendationItem;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ item, onPress }) => {
  const isCookNow = item.missing_ingredients.length === 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
      ) : null}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isCookNow ? '#e8f5e9' : '#fff3e0' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isCookNow ? '#2e7d32' : '#e65100' },
              ]}
            >
              {isCookNow ? 'Cook Now' : `Needs ${item.missing_ingredients.length}`}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {item.cuisine ? <Text style={styles.metaBadge}>🏷️ {item.cuisine}</Text> : null}
          {item.total_time_minutes ? (
            <Text style={styles.metaBadge}>⏱️ {item.total_time_minutes}m</Text>
          ) : null}
          <Text style={styles.matchBadge}>
            Match: {item.matched_count}/{item.required_count} ({item.match_percent}%)
          </Text>
        </View>

        {item.recommendation_reasons && item.recommendation_reasons.length > 0 ? (
          <View style={styles.reasonsContainer}>
            {item.recommendation_reasons.slice(0, 2).map((reason, idx) => (
              <Text key={idx} style={styles.reasonText}>
                ✨ {reason}
              </Text>
            ))}
          </View>
        ) : null}

        {item.missing_ingredients && item.missing_ingredients.length > 0 ? (
          <Text style={styles.missingText}>
            Missing: {item.missing_ingredients.join(', ')}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  metaBadge: {
    fontSize: 12,
    color: '#555',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matchBadge: {
    fontSize: 12,
    color: '#0288d1',
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
  },
  reasonsContainer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 6,
  },
  reasonText: {
    fontSize: 12,
    color: '#388e3c',
    marginBottom: 2,
    fontWeight: '500',
  },
  missingText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
