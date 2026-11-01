import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { IngredientCard } from '../components/IngredientCard';
import { CATALOG_INGREDIENTS, CatalogIngredient } from '../data/mockIngredients';
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '../api/pantry';
import { PantryItem } from '../types';
import { EmptyState } from '../components/EmptyState';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Protein', 'Spices'];

export const IngredientBrowserScreen = ({ route, navigation }: any) => {
  const initialCategory = route.params?.category || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPantry = useCallback(async () => {
    try {
      const data = await getPantryItems();
      setPantryItems(data);
    } catch (e) {
      console.warn('Could not load pantry:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPantry();
  }, [loadPantry]);

  const getPantryQuantity = (ingredientName: string): { qty: number; id?: string } => {
    const item = pantryItems.find(
      (p) =>
        p.display_name.toLowerCase().includes(ingredientName.toLowerCase()) ||
        ingredientName.toLowerCase().includes(p.display_name.toLowerCase())
    );
    return {
      qty: item ? (item.quantity ?? 1) : 0,
      id: item?.id,
    };
  };

  const handleIncrement = async (ingredient: CatalogIngredient) => {
    const { qty, id } = getPantryQuantity(ingredient.name);
    try {
      if (id) {
        const newQty = qty + 1;
        await updatePantryItem(id, { quantity: newQty });
        setPantryItems((prev) =>
          prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p))
        );
      } else {
        const added = await addPantryItem({
          display_name: ingredient.name,
          category: ingredient.category.toLowerCase(),
          quantity: 1,
          unit: ingredient.defaultUnit,
        });
        setPantryItems((prev) => [...prev, added]);
      }
    } catch (err: any) {
      Alert.alert('Pantry', err?.message || 'Could not update pantry');
    }
  };

  const handleDecrement = async (ingredient: CatalogIngredient) => {
    const { qty, id } = getPantryQuantity(ingredient.name);
    if (!id) return;
    try {
      if (qty <= 1) {
        await deletePantryItem(id);
        setPantryItems((prev) => prev.filter((p) => p.id !== id));
      } else {
        const newQty = qty - 1;
        await updatePantryItem(id, { quantity: newQty });
        setPantryItems((prev) =>
          prev.map((p) => (p.id === id ? { ...p, quantity: newQty } : p))
        );
      }
    } catch (err: any) {
      Alert.alert('Pantry', err?.message || 'Could not update pantry');
    }
  };

  const filteredIngredients = CATALOG_INGREDIENTS.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Deep Forest-Teal Curved Header */}
      <AppHeader
        title={selectedCategory === 'All' ? 'Fresh Ingredients' : selectedCategory}
        subtitle="Daily foods"
        onBack={() => navigation.goBack()}
        pantryCount={pantryItems.length}
        onPantryPress={() => navigation.navigate('PantryTab')}
      >
        {/* Horizontal Category Tabs inside Header */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </AppHeader>

      {/* Rounded Search Bar sitting directly below curved header */}
      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search for fresh ingredients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerArea}>
          <ActivityIndicator size="large" color={colors.forest} />
        </View>
      ) : filteredIngredients.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Ingredients Found"
          description={`No ingredients matching "${searchQuery}" in ${selectedCategory}.`}
          buttonTitle="Clear Search"
          onButtonPress={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <FlatList
          data={filteredIngredients}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const { qty } = getPantryQuantity(item.name);
            return (
              <IngredientCard
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
                style={styles.gridCard}
              />
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  tabsRow: {
    paddingVertical: 10,
    gap: 16,
    alignItems: 'center',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.lime,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedLight,
  },
  tabTextActive: {
    color: colors.lime,
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: spacing.gutter,
    marginTop: -16,
    marginBottom: 12,
    zIndex: 10,
  },
  gridContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 90,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridCard: {
    width: '48%',
    marginRight: 0,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
