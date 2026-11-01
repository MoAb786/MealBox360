import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getPantryItems, getExpiringItems } from '../api/pantry';
import { getRecommendations } from '../api/recipes';
import { getMealHistorySummary } from '../api/history';
import { RecipeCard } from '../components/RecipeCard';
import { RecommendationItem, PantryItem } from '../types';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pantryCount, setPantryCount] = useState(0);
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
  const [cookNowItems, setCookNowItems] = useState<RecommendationItem[]>([]);
  const [almostThereItems, setAlmostThereItems] = useState<RecommendationItem[]>([]);
  const [historySummary, setHistorySummary] = useState<{ total_meals_cooked: number } | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [pantry, expiring, cookNowRes, almostRes, summary] = await Promise.allSettled([
        getPantryItems(),
        getExpiringItems(7),
        getRecommendations({ mode: 'cook_now', limit: 3 }),
        getRecommendations({ mode: 'almost_there', limit: 3 }),
        getMealHistorySummary(),
      ]);

      if (pantry.status === 'fulfilled') {
        setPantryCount(pantry.value.length);
      }
      if (expiring.status === 'fulfilled') {
        setExpiringItems(expiring.value);
      }
      if (cookNowRes.status === 'fulfilled') {
        setCookNowItems(cookNowRes.value.items);
      }
      if (almostRes.status === 'fulfilled') {
        setAlmostThereItems(almostRes.value.items);
      }
      if (summary.status === 'fulfilled') {
        setHistorySummary(summary.value);
      }
    } catch (err) {
      console.error('Error loading home dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>
          Hello, {user?.display_name || 'Chef'}! 👋
        </Text>
        <Text style={styles.greetingSubtitle}>
          What are we cooking with today's pantry?
        </Text>
      </View>

      {/* Overview Metric Cards */}
      <View style={styles.metricsRow}>
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => navigation.navigate('PantryTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.metricIcon}>🥫</Text>
          <Text style={styles.metricValue}>{pantryCount}</Text>
          <Text style={styles.metricLabel}>Pantry Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricCard, expiringItems.length > 0 && styles.expiringCard]}
          onPress={() => navigation.navigate('PantryTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.metricIcon}>⏳</Text>
          <Text style={[styles.metricValue, expiringItems.length > 0 && styles.expiringValue]}>
            {expiringItems.length}
          </Text>
          <Text style={styles.metricLabel}>Expiring Soon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => navigation.navigate('HistoryTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.metricIcon}>🍳</Text>
          <Text style={styles.metricValue}>{historySummary?.total_meals_cooked ?? 0}</Text>
          <Text style={styles.metricLabel}>Cooked Meals</Text>
        </TouchableOpacity>
      </View>

      {/* Expiring Soon Banner */}
      {expiringItems.length > 0 ? (
        <View style={styles.expiringBanner}>
          <Text style={styles.bannerTitle}>⚠️ Use Before It Expires:</Text>
          <Text style={styles.bannerSubtitle}>
            {expiringItems.map((i) => i.display_name).join(', ')}
          </Text>
        </View>
      ) : null}

      {/* Quick Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={() => navigation.navigate('PantryTab')}
        >
          <Text style={styles.actionBtnTextPrimary}>+ Add Ingredients</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => navigation.navigate('DiscoverTab')}
        >
          <Text style={styles.actionBtnTextSecondary}>Discover Recipes 🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#0288d1" />
          <Text style={styles.loadingText}>Fetching personalized recipes...</Text>
        </View>
      ) : (
        <>
          {/* Cook Now Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🟢 Ready to Cook Now</Text>
              <Text style={styles.sectionSubtitle}>You have all required ingredients</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          {cookNowItems.length > 0 ? (
            cookNowItems.map((item) => (
              <RecipeCard
                key={item.recipe_id}
                item={item}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No 100% matches right now. Add a few staples or check Almost There!
              </Text>
            </View>
          )}

          {/* Almost There Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🟠 Almost There</Text>
              <Text style={styles.sectionSubtitle}>Missing just 1 or 2 ingredients</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          {almostThereItems.length > 0 ? (
            almostThereItems.map((item) => (
              <RecipeCard
                key={item.recipe_id}
                item={item}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Add ingredients to your pantry to see recommendations!</Text>
            </View>
          )}
        </>
      )}

      {/* Non-Medical Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          ℹ️ MealBox360 provides lifestyle meal-planning convenience. It is not medical advice. Nutrition information is estimated where available.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  greetingSection: { marginTop: 12, marginBottom: 16 },
  greetingTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  greetingSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  expiringCard: { borderColor: '#f97316', backgroundColor: '#fffaf5' },
  metricIcon: { fontSize: 22, marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  expiringValue: { color: '#ea580c' },
  metricLabel: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'center' },
  expiringBanner: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 13, fontWeight: 'bold', color: '#c2410c' },
  bannerSubtitle: { fontSize: 12, color: '#7c2d12', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: '#0288d1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnTextPrimary: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnTextSecondary: { color: '#334155', fontWeight: 'bold', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  sectionSubtitle: { fontSize: 12, color: '#64748b' },
  seeAllText: { fontSize: 13, color: '#0288d1', fontWeight: '600' },
  loadingArea: { padding: 40, alignItems: 'center' },
  loadingText: { color: '#64748b', marginTop: 10, fontSize: 14 },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center' },
  disclaimerContainer: {
    marginTop: 10,
    marginBottom: 40,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  disclaimerText: { fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 16 },
});
