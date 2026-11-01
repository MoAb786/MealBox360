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
import { getMealHistory, getMealHistorySummary, deleteMealHistory, updateMealHistory } from '../api/history';
import { MealHistoryEntry, HistorySummary } from '../types';
import { EmptyState } from '../components/EmptyState';

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
      console.error('Error fetching meal history:', err);
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
      {/* Summary Card */}
      {summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🏆 Home Cooking Record</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryCount}>{summary.total_meals_cooked}</Text>
              <Text style={styles.summarySub}>Total Meals Made</Text>
            </View>
            {summary.most_cooked_recipes && summary.most_cooked_recipes.length > 0 ? (
              <View style={styles.topMealBox}>
                <Text style={styles.topMealLabel}>Favourite Dish:</Text>
                <Text style={styles.topMealTitle} numberOfLines={1}>
                  {summary.most_cooked_recipes[0].title}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centerArea}>
          <ActivityIndicator size="large" color="#0288d1" />
        </View>
      ) : history.length === 0 ? (
        <EmptyState
          icon="🍳"
          title="No Cooked Meals Yet"
          description="Whenever you cook a recipe, tap 'Mark as Cooked' to track your homemade meal milestones!"
          buttonTitle="Discover Recipes"
          onButtonPress={() => navigation.navigate('DiscoverTab')}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
                  style={{ flex: 1 }}
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryCount: { fontSize: 28, fontWeight: 'bold', color: '#0288d1' },
  summarySub: { fontSize: 12, color: '#64748b' },
  topMealBox: { flex: 1, marginLeft: 20, alignItems: 'flex-end' },
  topMealLabel: { fontSize: 11, color: '#94a3b8' },
  topMealTitle: { fontSize: 13, fontWeight: 'bold', color: '#334155' },
  list: { paddingBottom: 20 },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  recipeTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cookedDate: { fontSize: 12, color: '#64748b', marginTop: 4 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 14, color: '#94a3b8' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
  viewRecipeText: { fontSize: 12, color: '#0288d1', fontWeight: 'bold' },
});
