export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  is_active: boolean;
}

export interface UserPreferences {
  user_id?: string;
  diet_type: 'vegetarian' | 'eggetarian' | 'non_vegetarian' | 'vegan' | 'no_preference';
  allergies: string[];
  disliked_ingredients: string[];
  preferred_cuisines: string[];
  max_cooking_minutes?: number | null;
  budget_per_serving_inr?: number | null;
  cooking_skill: 'beginner' | 'intermediate' | 'confident';
  servings_default: number;
}

export interface PantryItem {
  id: string;
  user_id: string;
  ingredient_id?: string | null;
  display_name: string;
  canonical_name?: string | null;
  quantity?: number | null;
  unit?: string | null;
  category?: string | null;
  expiry_date?: string | null;
  added_at: string;
  updated_at: string;
  source: string;
  notes?: string | null;
  expiry_status?: 'fresh' | 'use_soon' | 'expired' | 'unknown';
}

export interface NutritionInfo {
  calories_kcal?: number | null;
  protein_g?: number | null;
  carbohydrates_g?: number | null;
  fat_g?: number | null;
  source?: string | null;
  is_estimate: boolean;
}

export interface IngredientDetail {
  name: string;
  canonical_name?: string | null;
  quantity?: number | null;
  unit?: string | null;
  required: boolean;
  available?: boolean | null;
  is_staple?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  cuisine?: string | null;
  diet_tags: string[];
  allergen_tags: string[];
  allergen_status?: 'safe' | 'contains_allergen' | 'unverified';
  difficulty?: string | null;
  total_time_minutes?: number | null;
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  servings?: number | null;
  ingredient_names: string[];
  ingredients_detail: IngredientDetail[];
  steps: string[];
  nutrition_per_serving?: NutritionInfo | null;
  image_url?: string | null;
  source_url?: string | null;
  attribution?: string | null;
  average_rating?: number | null;
  rating_count: number;
  quantity_aware: boolean;
}

export interface RecommendationItem {
  recipe_id: string;
  title: string;
  cuisine?: string | null;
  diet_tags: string[];
  allergen_status?: 'safe' | 'contains_allergen' | 'unverified';
  match_percent: number;
  matched_count: number;
  required_count: number;
  missing_ingredients: string[];
  total_time_minutes?: number | null;
  difficulty?: string | null;
  recommendation_reasons: string[];
  nutrition?: NutritionInfo | null;
  image_url?: string | null;
  source_url?: string | null;
  average_rating?: number | null;
  score: number;
}

export interface MealHistoryEntry {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe_title_snapshot: string;
  cooked_at: string;
  servings: number;
  rating?: number | null;
  notes?: string | null;
  ingredients_used: string[];
}

export interface HistorySummary {
  total_meals_cooked: number;
  most_cooked_recipes: {
    recipe_id: string;
    title: string;
    times_cooked: number;
  }[];
}
