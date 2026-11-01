import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { IngredientBadge } from '../components/IngredientBadge';
import { getRecipeDetail, addFavourite, removeFavourite, getFavourites } from '../api/recipes';
import { markRecipeCooked } from '../api/history';
import { Recipe } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const RecipeDetailScreen = ({ route, navigation }: any) => {
  const { recipeId } = route.params;
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [cooking, setCooking] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const [data, favs] = await Promise.all([
          getRecipeDetail(recipeId),
          getFavourites().catch(() => []),
        ]);
        setRecipe(data);
        setIsFav(favs.some((f) => f.id === recipeId));
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [recipeId]);

  const toggleFavourite = async () => {
    try {
      if (isFav) {
        await removeFavourite(recipeId);
        setIsFav(false);
      } else {
        await addFavourite(recipeId);
        setIsFav(true);
      }
    } catch (err: any) {
      Alert.alert('Favourites', err?.message || 'Could not update favourites');
    }
  };

  const handleMarkCooked = async () => {
    if (!recipe) return;
    setCooking(true);
    try {
      await markRecipeCooked({
        recipe_id: recipe.id,
        servings: recipe.servings || 1,
      });

      const message = recipe.quantity_aware
        ? 'Great job! Meal recorded in your history.'
        : 'Great job! Meal recorded in your history. (Note: pantry quantities were not automatically deducted because this recipe has presence-only ingredients).';

      Alert.alert('Meal Cooked! 🍳', message, [
        { text: 'View History', onPress: () => navigation.navigate('HistoryTab') },
        { text: 'Done', style: 'cancel' },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not record cooked meal');
    } finally {
      setCooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerArea}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centerArea}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Recipe Details"
        subtitle="Home cooking"
        onBack={() => navigation.goBack()}
        onPantryPress={() => navigation.navigate('PantryTab')}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Hero Food Image Frame */}
        <View style={styles.imageCard}>
          {recipe.image_url ? (
            <Image source={{ uri: recipe.image_url }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={{ fontSize: 48 }}>🥘</Text>
            </View>
          )}
        </View>

        {/* Title & Favourite Row */}
        <View style={styles.contentCard}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{recipe.title}</Text>
            <TouchableOpacity onPress={toggleFavourite} style={styles.heartBtn} activeOpacity={0.8}>
              <Text style={styles.heartIcon}>{isFav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          {recipe.description ? (
            <Text style={styles.description}>{recipe.description}</Text>
          ) : null}

          {/* Metadata Strip */}
          <View style={styles.metaRow}>
            {recipe.cuisine ? <Text style={styles.metaPill}>🏷️ {recipe.cuisine}</Text> : null}
            {recipe.total_time_minutes ? (
              <Text style={styles.metaPill}>⏱️ {recipe.total_time_minutes} min</Text>
            ) : null}
            {recipe.servings ? (
              <Text style={styles.metaPill}>👥 {recipe.servings} servings</Text>
            ) : null}
            {recipe.difficulty && recipe.difficulty !== 'unknown' ? (
              <Text style={styles.metaPill}>📊 {recipe.difficulty}</Text>
            ) : null}
          </View>

          {/* Nutrition Strip if available */}
          {recipe.nutrition_per_serving && recipe.nutrition_per_serving.calories_kcal ? (
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionTitle}>📊 Nutrition per serving</Text>
              <Text style={styles.nutritionValue}>
                {Math.round(recipe.nutrition_per_serving.calories_kcal)} kcal
                {recipe.nutrition_per_serving.protein_g
                  ? ` • ${recipe.nutrition_per_serving.protein_g}g protein`
                  : ''}
              </Text>
            </View>
          ) : null}

          {/* Ingredients Checklist */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionHeading}>Ingredients Checklist</Text>
            <Text style={styles.sectionSubtitle}>
              🟢 Available in pantry  •  🔴 Missing
            </Text>

            <View style={styles.ingredientsWrap}>
              {recipe.ingredients_detail && recipe.ingredients_detail.length > 0 ? (
                recipe.ingredients_detail.map((ing, idx) => (
                  <View key={idx} style={styles.ingredientRow}>
                    <IngredientBadge
                      name={ing.name}
                      status={ing.available ? 'available' : 'missing'}
                      quantity={ing.quantity}
                      unit={ing.unit}
                    />
                    {!ing.required ? (
                      <Text style={styles.optionalText}>(optional staple)</Text>
                    ) : null}
                  </View>
                ))
              ) : (
                recipe.ingredient_names.map((name, idx) => (
                  <View key={idx} style={styles.ingredientRow}>
                    <IngredientBadge name={name} status="available" />
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Cooking Instructions */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionHeading}>Cooking Instructions</Text>
            {recipe.steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {recipe.attribution ? (
            <Text style={styles.attributionText}>Source: {recipe.attribution}</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.cookBtn, cooking && { opacity: 0.7 }]}
          onPress={handleMarkCooked}
          disabled={cooking}
          activeOpacity={0.88}
        >
          {cooking ? (
            <ActivityIndicator color={colors.forest} />
          ) : (
            <Text style={styles.cookBtnText}>🍳 Mark as Cooked</Text>
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
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    ...shadows.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    flex: 1,
    marginRight: 10,
  },
  heartBtn: {
    width: 40,
    height: 40,
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
  description: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  metaPill: {
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
  },
  nutritionBox: {
    backgroundColor: colors.limeSoft,
    padding: 10,
    borderRadius: radius.sm,
    marginVertical: 10,
  },
  nutritionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forest,
  },
  nutritionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.forestSoft,
    marginTop: 2,
  },
  sectionDivider: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 10,
  },
  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionalText: {
    fontSize: 11,
    color: colors.mutedLight,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.forest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
  },
  attributionText: {
    fontSize: 11,
    color: colors.mutedLight,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.floating,
  },
  cookBtn: {
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.subtle,
  },
  cookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.forest,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
  },
});
