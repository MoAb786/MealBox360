import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { CategoryShortcut } from '../components/CategoryShortcut';
import { IngredientCard } from '../components/IngredientCard';
import { RecipeCard } from '../components/RecipeCard';
import { CATALOG_INGREDIENTS, CatalogIngredient } from '../data/mockIngredients';
import { useAuth } from '../context/AuthContext';
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '../api/pantry';
import { getRecommendations } from '../api/recipes';
import { PantryItem, RecommendationItem } from '../types';

const CATEGORY_ITEMS = [
  { id: 'Vegetables', label: 'Vege', icon: '🥦', bg: colors.categoryBg2 },
  { id: 'Fruits', label: 'Fruits', icon: '🍎', bg: colors.categoryBg4 },
  { id: 'Grains', label: 'Grains', icon: '🌾', bg: colors.categoryBg1 },
  { id: 'Dairy', label: 'Dairy', icon: '🧀', bg: colors.categoryBg5 },
  { id: 'Protein', label: 'Protein', icon: '🥚', bg: colors.categoryBg3 },
  { id: 'Spices', label: 'Spices', icon: '🌶️', bg: colors.categoryBg6 },
];

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [cookNowItems, setCookNowItems] = useState<RecommendationItem[]>([]);
  const [almostThereItems, setAlmostThereItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [pantryRes, cookNowRes, almostRes] = await Promise.allSettled([
        getPantryItems(),
        getRecommendations({ mode: 'cook_now', limit: 4 }),
        getRecommendations({ mode: 'almost_there', limit: 4 }),
      ]);

      if (pantryRes.status === 'fulfilled') setPantry(pantryRes.value);
      if (cookNowRes.status === 'fulfilled') setCookNowItems(cookNowRes.value.items);
      if (almostRes.status === 'fulfilled') setAlmostThereItems(almostRes.value.items);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPantryQty = (name: string): { qty: number; id?: string } => {
    const item = pantry.find(
      (p) =>
        p.display_name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.display_name.toLowerCase())
    );
    return { qty: item ? (item.quantity ?? 1) : 0, id: item?.id };
  };

  const handleIncrement = async (ingredient: CatalogIngredient) => {
    const { qty, id } = getPantryQty(ingredient.name);
    try {
      if (id) {
        const newQty = qty + 1;
        await updatePantryItem(id, { quantity: newQty });
        setPantry((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p)));
      } else {
        const added = await addPantryItem({
          display_name: ingredient.name,
          category: ingredient.category.toLowerCase(),
          quantity: 1,
          unit: ingredient.defaultUnit,
        });
        setPantry((prev) => [...prev, added]);
      }
    } catch (err: any) {
      Alert.alert('Pantry', err?.message || 'Could not update pantry');
    }
  };

  const handleDecrement = async (ingredient: CatalogIngredient) => {
    const { qty, id } = getPantryQty(ingredient.name);
    if (!id) return;
    try {
      if (qty <= 1) {
        await deletePantryItem(id);
        setPantry((prev) => prev.filter((p) => p.id !== id));
      } else {
        const newQty = qty - 1;
        await updatePantryItem(id, { quantity: newQty });
        setPantry((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p)));
      }
    } catch (err: any) {
      Alert.alert('Pantry', err?.message || 'Could not update pantry');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 1. Curved Forest-Teal Header */}
      <AppHeader
        title="What's in your kitchen?"
        subtitle={`Good day, ${user?.display_name || 'Chef'}`}
        pantryCount={pantry.length}
        onPantryPress={() => navigation.navigate('PantryTab')}
      >
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search ingredients or recipes..."
            onPress={() => navigation.navigate('DiscoverTab')}
            editable={false}
          />
        </View>
      </AppHeader>

      {/* 2. Category Shortcuts */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRail}
        >
          {CATEGORY_ITEMS.map((cat) => (
            <CategoryShortcut
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              bgColor={cat.bg}
              onPress={() => navigation.navigate('IngredientBrowser', { category: cat.id })}
            />
          ))}
        </ScrollView>
      </View>

      {/* 3. Promotional / Lifestyle Tip Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.promoBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoBadge}>💡 Smart cooking tip</Text>
            <Text style={styles.promoTitle}>Cook more with what you have</Text>
            <Text style={styles.promoSub}>
              Use up ingredients before they expire — less waste, more flavour!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => navigation.navigate('DiscoverTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.promoBtnText}>Explore →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. "You might need" Horizontal Rail */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>You might need</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('IngredientBrowser', { category: 'All' })}
        >
          <Text style={styles.seeMoreText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalRail}
      >
        {CATALOG_INGREDIENTS.slice(0, 6).map((item) => {
          const { qty } = getPantryQty(item.name);
          return (
            <IngredientCard
              key={item.id}
              id={item.id}
              name={item.name}
              category={item.category}
              unit={item.defaultUnit}
              quantityInPantry={qty}
              image={item.image}
              onPress={() =>
                navigation.navigate('IngredientDetail', {
                  ingredientId: item.id,
                  initialIngredient: item,
                })
              }
              onIncrement={() => handleIncrement(item)}
              onDecrement={() => handleDecrement(item)}
            />
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.centerArea}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching personalized recipes...</Text>
        </View>
      ) : (
        <>
          {/* 5. "Cook now" Recipe Rail */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Ready to Cook Now 🟢</Text>
              <Text style={styles.sectionSubtitle}>100% ingredients matched in your pantry</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.seeMoreText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recipeList}>
            {cookNowItems.length > 0 ? (
              cookNowItems.map((recipe) => (
                <RecipeCard
                  key={recipe.recipe_id}
                  item={recipe}
                  onPress={() =>
                    navigation.navigate('RecipeDetail', { recipeId: recipe.recipe_id })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No full matches yet 🍲</Text>
                <Text style={styles.emptySub}>
                  Add everyday items like onions or rice to your pantry to unlock instant meals!
                </Text>
              </View>
            )}
          </View>

          {/* 6. "Almost there" Recipe Rail */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Almost There 🟠</Text>
              <Text style={styles.sectionSubtitle}>Missing only 1 or 2 ingredients</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.seeMoreText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recipeList}>
            {almostThereItems.length > 0 ? (
              almostThereItems.map((recipe) => (
                <RecipeCard
                  key={recipe.recipe_id}
                  item={recipe}
                  onPress={() =>
                    navigation.navigate('RecipeDetail', { recipeId: recipe.recipe_id })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Keep building your pantry! 🥫</Text>
                <Text style={styles.emptySub}>
                  Recipes missing just 1 or 2 items will automatically appear here.
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Non-medical disclaimer footer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          MealBox360 is a lifestyle cooking companion. Not medical advice. Always check food labels for allergens.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,           // #F0EDE4 warm off-white
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  categorySection: {
    marginTop: -8,
    marginBottom: 16,
    zIndex: 10,
  },
  categoryRail: {
    paddingHorizontal: spacing.gutter,
  },
  bannerContainer: {
    paddingHorizontal: spacing.gutter,
    marginBottom: 18,
  },
  promoBanner: {
    backgroundColor: colors.primary,      // forest green banner
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  promoBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,                  // golden accent
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  promoBtn: {
    backgroundColor: colors.accent,       // golden CTA
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginLeft: 10,
  },
  promoBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.gutter,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeMoreText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  horizontalRail: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 10,
  },
  recipeList: {
    paddingHorizontal: spacing.gutter,
  },
  centerArea: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disclaimerContainer: {
    marginHorizontal: spacing.gutter,
    marginTop: 20,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
