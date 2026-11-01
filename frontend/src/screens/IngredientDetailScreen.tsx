import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { QuantityStepper } from '../components/QuantityStepper';
import { CATALOG_INGREDIENTS, CatalogIngredient } from '../data/mockIngredients';
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '../api/pantry';
import { searchRecipes } from '../api/recipes';
import { PantryItem, Recipe } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const IngredientDetailScreen = ({ route, navigation }: any) => {
  const { ingredientId, initialIngredient } = route.params || {};
  const insets = useSafeAreaInsets();

  const ingredient: CatalogIngredient =
    initialIngredient ||
    CATALOG_INGREDIENTS.find((i) => i.id === ingredientId) ||
    CATALOG_INGREDIENTS[0];

  const [pantryItem, setPantryItem] = useState<PantryItem | null>(null);
  const [localQuantity, setLocalQuantity] = useState<number>(1);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pantryData, searchRes] = await Promise.all([
          getPantryItems().catch(() => []),
          searchRecipes(ingredient.name.split(' ')[0]).catch(() => ({ results: [], total: 0 })),
        ]);

        const matched = pantryData.find(
          (p) =>
            p.display_name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
            ingredient.name.toLowerCase().includes(p.display_name.toLowerCase())
        );

        if (matched) {
          setPantryItem(matched);
          setLocalQuantity(matched.quantity ?? 1);
        } else {
          setLocalQuantity(1);
        }

        setRelatedRecipes(searchRes.results.slice(0, 4));
      } catch (e) {
        console.warn('Error loading ingredient detail:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ingredient.name]);

  const handleSaveToPantry = async () => {
    setSubmitting(true);
    try {
      if (pantryItem) {
        const updated = await updatePantryItem(pantryItem.id, {
          quantity: localQuantity,
        });
        setPantryItem(updated);
        Alert.alert('Pantry Updated', `Updated ${ingredient.name} quantity to ${localQuantity}.`);
      } else {
        const added = await addPantryItem({
          display_name: ingredient.name,
          category: ingredient.category.toLowerCase(),
          quantity: localQuantity,
          unit: ingredient.defaultUnit,
        });
        setPantryItem(added);
        Alert.alert('Added to Pantry', `Added ${ingredient.name} (${localQuantity}) to your digital pantry.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update pantry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromPantry = async () => {
    if (!pantryItem) return;
    Alert.alert('Remove', `Remove ${ingredient.name} from pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePantryItem(pantryItem.id);
            setPantryItem(null);
            setLocalQuantity(1);
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Could not remove item');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Ingredient Details"
        subtitle="Kitchen essentials"
        onBack={() => navigation.goBack()}
        onPantryPress={() => navigation.navigate('PantryTab')}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Food Image Frame */}
        <View style={styles.imageCard}>
          <Image source={{ uri: ingredient.image }} style={styles.heroImage} resizeMode="cover" />
        </View>

        {/* Title & Bookmark Section */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{ingredient.name}</Text>
              <Text style={styles.categoryPill}>
                {ingredient.category} • {ingredient.defaultUnit}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => setIsBookmarked(!isBookmarked)}
              activeOpacity={0.8}
            >
              <Text style={styles.heartIcon}>{isBookmarked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          {/* Pantry Stock Status Banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: pantryItem ? colors.limeSoft : '#F1F5F9' },
            ]}
          >
            <Text style={styles.statusEmoji}>{pantryItem ? '🥫' : '➕'}</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.statusTitle}>
                {pantryItem
                  ? `In Your Pantry (${pantryItem.quantity ?? 1} ${pantryItem.unit || ''})`
                  : 'Not in Pantry'}
              </Text>
              <Text style={styles.statusSub}>
                {pantryItem
                  ? 'Ready to be used in your home-cooked recipes.'
                  : 'Add this to unlock more recipe recommendations!'}
              </Text>
            </View>
            {pantryItem ? (
              <TouchableOpacity onPress={handleRemoveFromPantry} style={styles.removeTextBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Description */}
          <Text style={styles.sectionHeading}>About this ingredient</Text>
          <Text style={styles.descriptionText}>{ingredient.description}</Text>

          {/* Storage & Freshness tip */}
          {ingredient.storageTip ? (
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Storage & Freshness Tip</Text>
              <Text style={styles.tipBody}>{ingredient.storageTip}</Text>
            </View>
          ) : null}

          {/* Recipes with this ingredient */}
          <View style={styles.recipeRailSection}>
            <Text style={styles.sectionHeading}>Recipes with {ingredient.name}</Text>
            {relatedRecipes.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeRail}>
                {relatedRecipes.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.miniRecipeCard}
                    onPress={() => navigation.navigate('RecipeDetail', { recipeId: r.id })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.miniImageContainer}>
                      {r.image_url ? (
                        <Image source={{ uri: r.image_url }} style={styles.miniImage} />
                      ) : (
                        <Text style={{ fontSize: 24 }}>🍲</Text>
                      )}
                    </View>
                    <Text style={styles.miniTitle} numberOfLines={2}>
                      {r.title}
                    </Text>
                    {r.total_time_minutes ? (
                      <Text style={styles.miniMeta}>⏱️ {r.total_time_minutes}m</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noRecipesText}>
                Explore recommendations in the Discover tab to see what you can make!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar matching reference image 2 */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.stepperWrap}>
          <QuantityStepper
            quantity={localQuantity}
            min={1}
            onIncrement={() => setLocalQuantity((q) => q + 1)}
            onDecrement={() => setLocalQuantity((q) => Math.max(1, q - 1))}
          />
        </View>

        <TouchableOpacity
          style={[styles.mainActionBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSaveToPantry}
          disabled={submitting}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color={colors.forest} />
          ) : (
            <Text style={styles.mainActionText}>
              {pantryItem ? '✓ Update Pantry' : '+ Add to Pantry'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 10,
  },
  imageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 220,
    width: '100%',
    overflow: 'hidden',
    ...shadows.subtle,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    ...shadows.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  categoryPill: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  heartBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.page,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heartIcon: {
    fontSize: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    marginVertical: 12,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forest,
  },
  statusSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  removeTextBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 14,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: '#FEF9C3',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#854D0E',
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 12,
    color: '#713F12',
    lineHeight: 18,
  },
  recipeRailSection: {
    marginTop: 16,
  },
  recipeRail: {
    flexDirection: 'row',
    marginTop: 8,
  },
  miniRecipeCard: {
    width: 130,
    backgroundColor: colors.page,
    borderRadius: radius.md,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniImageContainer: {
    width: '100%',
    height: 75,
    borderRadius: radius.sm,
    backgroundColor: colors.mint,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniImage: {
    width: '100%',
    height: '100%',
  },
  miniTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    minHeight: 30,
  },
  miniMeta: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  noRecipesText: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.floating,
  },
  stepperWrap: {
    width: 100,
    marginRight: 12,
  },
  mainActionBtn: {
    flex: 1,
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.subtle,
  },
  mainActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forest,
  },
});
