import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { getRecommendations } from '../api/recipes';
import { RecommendationItem } from '../types';

export const DiscoverScreen = ({ navigation }: any) => {
  const [mode, setMode] = useState<'cook_now' | 'almost_there'>('cook_now');
  const [recipes, setRecipes] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecommendations({
        mode,
        max_time: maxTime,
        limit: 50,
      });
      setRecipes(data.items);
    } catch (err: any) {
      console.warn('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, maxTime]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecommendations();
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Discover Recipes"
        subtitle="Smart meal planning"
        onPantryPress={() => navigation.navigate('PantryTab')}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search recipes..."
          value={searchFilter}
          onChangeText={setSearchFilter}
        />
      </View>

      {/* Segmented Control: Ready to Cook vs Almost There */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, mode === 'cook_now' && styles.segmentActive]}
          onPress={() => setMode('cook_now')}
          activeOpacity={0.85}
        >
          <Text
            style={[styles.segmentText, mode === 'cook_now' && styles.segmentTextActive]}
          >
            🟢 Ready to Cook
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, mode === 'almost_there' && styles.segmentActive]}
          onPress={() => setMode('almost_there')}
          activeOpacity={0.85}
        >
          <Text
            style={[styles.segmentText, mode === 'almost_there' && styles.segmentTextActive]}
          >
            🟠 Almost There
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time filter chips */}
      <View style={styles.timeChipsRow}>
        <Text style={styles.chipLabel}>Max Time:</Text>
        {[undefined, 15, 30, 45].map((mins) => (
          <TouchableOpacity
            key={mins === undefined ? 'any' : mins}
            style={[styles.timeChip, maxTime === mins && styles.timeChipSelected]}
            onPress={() => setMaxTime(mins)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.timeChipText,
                maxTime === mins && styles.timeChipTextSelected,
              ]}
            >
              {mins === undefined ? 'Any' : `≤ ${mins}m`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerArea}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Scoring recipes against your pantry...</Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          icon={mode === 'cook_now' ? '🍳' : '🛒'}
          title={
            mode === 'cook_now'
              ? 'No Complete Matches Yet'
              : 'No "Almost There" Recipes'
          }
          description={
            mode === 'cook_now'
              ? 'Switch to "Almost There" to see recipes you can make by adding just 1 or 2 items, or add more ingredients to your pantry!'
              : 'Add a few more pantry items to find recipes that are almost ready to cook.'
          }
          buttonTitle="Manage Digital Pantry"
          onButtonPress={() => navigation.navigate('PantryTab')}
        />
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.recipe_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <RecipeCard
              item={item}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchWrapper: {
    paddingHorizontal: spacing.gutter,
    marginTop: -16,
    marginBottom: 10,
    zIndex: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,             // big pill
    padding: 4,
    marginHorizontal: spacing.gutter,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  segmentActive: {
    backgroundColor: colors.primary,    // forest green active tab
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    marginBottom: 12,
    gap: 8,
  },
  chipLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  timeChipSelected: {
    backgroundColor: colors.accent,     // golden active chip
    borderColor: colors.accent,
  },
  timeChipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timeChipTextSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 90,
  },
});
