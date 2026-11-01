import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { getMealHistory, getMealHistorySummary, deleteMealHistory, updateMealHistory } from '../api/history';
import { MealHistoryEntry, HistorySummary } from '../types';

export const HistoryScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<MealHistoryEntry[]>([]);
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistoryData = useCallback(async () => {
    try {
      const [histData, sumData] = await Promise.all([
        getMealHistory(),
        getMealHistorySummary().catch(() => null),
      ]);
      setHistory(histData);
      setSummary(sumData);
    } catch (err: any) {
      console.warn('Error fetching meal history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistoryData();
  };

  const handleRate = (item: MealHistoryEntry) => {
    Alert.alert(
      'Rate This Meal',
      `How was "${item.recipe_title_snapshot}"?`,
      [
        { text: '⭐ 1', onPress: () => submitRating(item.id, 1) },
        { text: '⭐⭐ 2', onPress: () => submitRating(item.id, 2) },
        { text: '⭐⭐⭐ 3', onPress: () => submitRating(item.id, 3) },
        { text: '⭐⭐⭐⭐ 4', onPress: () => submitRating(item.id, 4) },
        { text: '⭐⭐⭐⭐⭐ 5', onPress: () => submitRating(item.id, 5) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitRating = async (id: string, rating: number) => {
    try {
      const updated = await updateMealHistory(id, { rating });
      setHistory((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update rating');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this meal from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMealHistory(id);
            setHistory((prev) => prev.filter((h) => h.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Could not delete entry');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Meal History"
        subtitle="Home cooking journal"
        onPantryPress={() => navigation.navigate('PantryTab')}
      />

      <View style={styles.mainWrapper}>
        {/* Milestone Summary Card */}
        {summary ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryCount}>{summary.total_meals_cooked}</Text>
              <Text style={styles.summarySub}>Meals Cooked at Home</Text>
            </View>
            {summary.most_cooked_recipes && summary.most_cooked_recipes.length > 0 ? (
              <View style={styles.topMealBox}>
                <Text style={styles.topMealLabel}>Favorite Dish:</Text>
                <Text style={styles.topMealTitle} numberOfLines={1}>
                  {summary.most_cooked_recipes[0].title}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {loading ? (
          <View style={styles.centerArea}>
            <ActivityIndicator size="large" color={colors.forest} />
          </View>
        ) : history.length === 0 ? (
          <EmptyState
            icon="🍳"
            title="No Cooked Meals Yet"
            description="Whenever you cook a recipe, tap 'Mark as Cooked' on the recipe screen to track your homemade meal milestones!"
            buttonTitle="Discover Recipes"
            onButtonPress={() => navigation.navigate('DiscoverTab')}
          />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
                    style={{ flex: 1 }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.recipeTitle}>{item.recipe_title_snapshot}</Text>
                    <Text style={styles.cookedDate}>
                      📅 {new Date(item.cooked_at).toLocaleDateString()} • {item.servings} serving(s)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerRow}>
                  <TouchableOpacity onPress={() => handleRate(item)} style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>
                      {item.rating ? '⭐'.repeat(item.rating) : '+ Add Rating'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
                  >
                    <Text style={styles.viewRecipeText}>View Recipe →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    marginTop: -16,
    zIndex: 10,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryCount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.forest,
  },
  summarySub: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  topMealBox: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  topMealLabel: {
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  topMealTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  list: {
    paddingBottom: 90,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  cookedDate: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 13,
    color: colors.mutedLight,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  ratingBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  ratingText: {
    fontSize: 12,
    color: '#854D0E',
    fontWeight: '600',
  },
  viewRecipeText: {
    fontSize: 12,
    color: colors.forest,
    fontWeight: '700',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
