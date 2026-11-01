import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { getRecommendations } from '../api/recipes';
import { RecipeCard } from '../components/RecipeCard';
import { RecommendationItem } from '../types';
import { EmptyState } from '../components/EmptyState';

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
      console.error('Error fetching recommendations:', err);
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
      {/* Segmented Control: Cook Now vs Almost There */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, mode === 'cook_now' && styles.segmentActive]}
          onPress={() => setMode('cook_now')}
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
        >
          <Text
            style={[styles.segmentText, mode === 'almost_there' && styles.segmentTextActive]}
          >
            🟠 Almost There (Missing 1–2)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter / Search Bar */}
      <View style={styles.filterBar}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter recipes by name..."
          value={searchFilter}
          onChangeText={setSearchFilter}
        />
      </View>

      {/* Time quick filter chips */}
      <View style={styles.timeChipsRow}>
        <Text style={styles.chipLabel}>Max Time:</Text>
        {[undefined, 15, 30, 45].map((mins) => (
          <TouchableOpacity
            key={mins === undefined ? 'any' : mins}
            style={[styles.timeChip, maxTime === mins && styles.timeChipSelected]}
            onPress={() => setMaxTime(mins)}
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
          <ActivityIndicator size="large" color="#0288d1" />
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
              ? 'Switch to "Almost There" to see what you can make by buying just 1 or 2 items, or add more ingredients to your pantry!'
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
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a', fontWeight: 'bold' },
  filterBar: { marginBottom: 10 },
  filterInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  timeChipsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  chipLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  timeChipSelected: { backgroundColor: '#0288d1', borderColor: '#0288d1' },
  timeChipText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  timeChipTextSelected: { color: '#ffffff', fontWeight: 'bold' },
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },
  listContent: { paddingBottom: 24 },
});
