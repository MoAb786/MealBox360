import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { getPreferences, updatePreferences } from '../api/auth';
import { UserPreferences } from '../types';

const DIET_TYPES = [
  { id: 'no_preference', label: 'No Preference' },
  { id: 'vegetarian', label: 'Vegetarian 🥦' },
  { id: 'eggetarian', label: 'Eggetarian 🥚' },
  { id: 'non_vegetarian', label: 'Non-Vegetarian 🍗' },
  { id: 'vegan', label: 'Vegan 🌱' },
];

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedDiet, setSelectedDiet] = useState('no_preference');
  const [allergiesText, setAllergiesText] = useState('');
  const [dislikedText, setDislikedText] = useState('');
  const [maxMinutes, setMaxMinutes] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPreferences();
        setPrefs(data);
        setSelectedDiet(data.diet_type || 'no_preference');
        setAllergiesText((data.allergies || []).join(', '));
        setDislikedText((data.disliked_ingredients || []).join(', '));
        setMaxMinutes(data.max_cooking_minutes ? String(data.max_cooking_minutes) : '');
      } catch (err: any) {
        console.warn('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const allergies = allergiesText
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const disliked = dislikedText
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const minutes = maxMinutes.trim() ? parseInt(maxMinutes.trim(), 10) : null;

      await updatePreferences({
        diet_type: selectedDiet as any,
        allergies,
        disliked_ingredients: disliked,
        max_cooking_minutes: minutes,
      });
      Alert.alert('Preferences Saved', 'Your dietary filters and constraints have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerArea}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="My Profile" subtitle="Preferences & Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{user?.display_name || 'Chef'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Dietary Preferences Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.dietOptions}>
            {DIET_TYPES.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.dietOption,
                  selectedDiet === d.id && styles.dietOptionSelected,
                ]}
                onPress={() => setSelectedDiet(d.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dietOptionText,
                    selectedDiet === d.id && styles.dietOptionTextSelected,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Known Allergies (comma-separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. peanut, dairy, egg, gluten"
            placeholderTextColor={colors.muted}
            value={allergiesText}
            onChangeText={setAllergiesText}
          />

          <Text style={styles.inputLabel}>Disliked Ingredients (comma-separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. mushroom, bitter gourd"
            placeholderTextColor={colors.muted}
            value={dislikedText}
            onChangeText={setDislikedText}
          />

          <Text style={styles.inputLabel}>Max Cooking Time (Minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 30"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={maxMinutes}
            onChangeText={setMaxMinutes}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.88}
          >
            {saving ? (
              <ActivityIndicator color={colors.forest} />
            ) : (
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Data Sources and Attribution */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Sources & Attribution</Text>
          <Text style={styles.attributionText}>
            • Indian Starter Recipes: Original curated set{'\n'}
            • Food.com Kaggle Dataset: Shuyang Li et al. (Academic use){'\n'}
            • Open Food Facts: Open Food Facts (ODbL){'\n'}
            • USDA FoodData Central: Agricultural Research Service (CC0)
          </Text>
        </View>

        {/* Medical Notice */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚖️ Important Lifestyle Notice</Text>
          <Text style={styles.disclaimerBody}>
            MealBox360 provides general meal-planning and food-choice assistance for lifestyle convenience. It is not medical advice. Always check product labels for allergens.
          </Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    marginTop: -16,
    paddingBottom: 90,
    zIndex: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dietOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  dietOption: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bg,
  },
  dietOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dietOptionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dietOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: radius.md,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: colors.bg,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,           // pill CTA
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: 'rgba(74,107,58,0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  attributionText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(232,193,50,0.12)',
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,193,50,0.30)',
    marginBottom: 14,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A5A00',
    marginBottom: 4,
  },
  disclaimerBody: {
    fontSize: 11,
    color: '#5A4100',
    lineHeight: 16,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.xl,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginBottom: 20,
  },
  logoutBtnText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
