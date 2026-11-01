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
import { getRecipeDetail, addFavourite, removeFavourite, getFavourites } from '../api/recipes';
import { markRecipeCooked } from '../api/history';
import { Recipe } from '../types';
import { IngredientBadge } from '../components/IngredientBadge';

export const RecipeDetailScreen = ({ route, navigation }: any) => {
  const { recipeId } = route.params;
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
      Alert.alert('Error', err?.message || 'Could not update favourites');
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
        <ActivityIndicator size="large" color="#0288d1" />
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
    <ScrollView style={styles.container}>
      {recipe.image_url ? (
        <Image source={{ uri: recipe.image_url }} style={styles.heroImage} resizeMode="cover" />
      ) : null}

      <View style={styles.body}>
        {/* Header Title & Fav Button */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{recipe.title}</Text>
          <TouchableOpacity onPress={toggleFavourite} style={styles.favBtn}>
            <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {recipe.description ? (
          <Text style={styles.description}>{recipe.description}</Text>
        ) : null}

        {/* Quick Meta Pills */}
        <View style={styles.metaRow}>
          {recipe.cuisine ? <Text style={styles.pill}>🏷️ {recipe.cuisine}</Text> : null}
          {recipe.total_time_minutes ? (
            <Text style={styles.pill}>⏱️ {recipe.total_time_minutes} min</Text>
          ) : null}
          {recipe.servings ? <Text style={styles.pill}>👥 {recipe.servings} servings</Text> : null}
          {recipe.difficulty && recipe.difficulty !== 'unknown' ? (
            <Text style={styles.pill}>📊 {recipe.difficulty}</Text>
          ) : null}
        </View>

        {/* Nutrition Panel (Only when reliable data exists) */}
        {recipe.nutrition_per_serving && recipe.nutrition_per_serving.calories_kcal ? (
          <View style={styles.nutritionBox}>
            <Text style={styles.nutritionTitle}>📊 Nutrition (per serving)</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionCol}>
                <Text style={styles.nutritionNum}>
                  {Math.round(recipe.nutrition_per_serving.calories_kcal)}
                </Text>
                <Text style={styles.nutritionLabel}>Calories (kcal)</Text>
              </View>
              {recipe.nutrition_per_serving.protein_g ? (
                <View style={styles.nutritionCol}>
                  <Text style={styles.nutritionNum}>{recipe.nutrition_per_serving.protein_g}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.nutritionNote}>
              Source: {recipe.nutrition_per_serving.source || 'Estimated'}
            </Text>
          </View>
        ) : null}

        {/* Ingredients Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Ingredients Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            🟢 In your pantry  •  🔴 Missing
          </Text>
          <View style={styles.ingredientsList}>
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

        {/* Cooking Steps */}
        <View style={styles.section}>
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

        {/* Attribution / Source */}
        {recipe.attribution ? (
          <Text style={styles.attributionText}>
            Recipe Source: {recipe.attribution}
          </Text>
        ) : null}

        {/* Mark as Cooked Button */}
        <TouchableOpacity
          style={[styles.cookBtn, cooking && styles.btnDisabled]}
          onPress={handleMarkCooked}
          disabled={cooking}
        >
          {cooking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cookBtnText}>🍳 Mark as Cooked</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 220, backgroundColor: '#cbd5e1' },
  body: { padding: 18, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', flex: 1, marginRight: 10 },
  favBtn: { padding: 8 },
  favIcon: { fontSize: 24 },
  description: { fontSize: 14, color: '#64748b', marginVertical: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10 },
  pill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  nutritionBox: {
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginVertical: 12,
  },
  nutritionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e40af', marginBottom: 8 },
  nutritionGrid: { flexDirection: 'row', gap: 20 },
  nutritionCol: { alignItems: 'center' },
  nutritionNum: { fontSize: 18, fontWeight: 'bold', color: '#1d4ed8' },
  nutritionLabel: { fontSize: 11, color: '#60a5fa' },
  nutritionNote: { fontSize: 10, color: '#6b7280', marginTop: 6, fontStyle: 'italic' },
  section: { marginTop: 18 },
  sectionHeading: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  ingredientsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center' },
  optionalText: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginLeft: 4 },
  stepItem: { flexDirection: 'row', marginBottom: 14 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0288d1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 22 },
  attributionText: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14, fontStyle: 'italic' },
  cookBtn: {
    backgroundColor: '#388e3c',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cookBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  btnDisabled: { opacity: 0.7 },
  errorText: { color: '#ef4444', fontSize: 16 },
});
