import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, StatusBar, Platform } from 'react-native';

// Important: When running on a physical device via Expo, change '127.0.0.1' 
// to your computer's local Wi-Fi IP address (e.g., 192.168.1.5)
const API_URL = 'http://192.168.1.39:8001'; 

interface RecipeRecommendation {
  recipe: string;
  status: string;
  match_rate: string;
  missing?: string[];
}

export default function App() {
  const [pantry, setPantry] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [networkError, setNetworkError] = useState<string | null>(null);

  const fetchPantry = async () => {
    try {
      const res = await fetch(`${API_URL}/pantry`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      setPantry(Array.isArray(data?.pantry) ? data.pantry : []);
      setNetworkError(null);
    } catch (error) {
      console.error("Error fetching pantry: ", error);
      setNetworkError(`Unable to reach backend at ${API_URL}`);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`${API_URL}/recommendations`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      setRecipes(Array.isArray(data?.recommendations) ? data.recommendations : []);
    } catch (error) {
      console.error("Error fetching recipes: ", error);
    }
  };

  const addIngredient = async () => {
    if (!newIngredient.trim()) return;
    try {
      const res = await fetch(`${API_URL}/pantry/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newIngredient.trim() })
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      setNewIngredient('');
      fetchPantry();
      fetchRecommendations();
    } catch (error) {
      console.error("Error adding ingredient: ", error);
    }
  };

  useEffect(() => {
    fetchPantry();
    fetchRecommendations();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>My Digital Pantry 🥫</Text>
      
      {networkError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {networkError}</Text>
          <Text style={styles.errorSubText}>Ensure the FastAPI backend is running with: uvicorn main:app --host 0.0.0.0 --port 8001</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Add an ingredient (e.g., 'butter')" 
          value={newIngredient}
          onChangeText={setNewIngredient}
        />
        <TouchableOpacity style={styles.button} onPress={addIngredient}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.pantryContainer}>
        <Text style={styles.subHeader}>Available Items:</Text>
        <Text style={styles.pantryList}>
          {pantry && pantry.length > 0 ? pantry.join(', ') : 'Pantry is empty'}
        </Text>
      </View>

      <Text style={styles.header}>Meal Recommendations 🍳</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item, index) => `${item?.recipe || index}`}
        renderItem={({item}) => (
          <View style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{item?.recipe ?? 'Unknown Recipe'}</Text>
            <Text style={[styles.recipeStatus, { color: item?.status?.includes('Cook Now') ? '#388e3c' : '#f57c00' }]}>
              {item?.status ?? ''}
            </Text>
            <Text style={styles.recipeDetails}>Ingredients Match: {item?.match_rate ?? '0/0'}</Text>
            {item?.missing && item.missing.length > 0 && (
              <Text style={styles.missingText}>Missing: {item.missing.join(', ')}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f4f6f8', 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 40 
  },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 15, color: '#1a1a1a' },
  subHeader: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#4a4a4a' },
  inputContainer: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', padding: 12, marginRight: 10, borderRadius: 8, backgroundColor: '#ffffff', fontSize: 16 },
  button: { backgroundColor: '#0288d1', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  pantryContainer: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  pantryList: { fontSize: 16, color: '#374151', lineHeight: 24 },
  recipeCard: { backgroundColor: '#ffffff', padding: 18, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#0288d1' },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  recipeStatus: { marginVertical: 6, fontWeight: '700', fontSize: 14 },
  recipeDetails: { color: '#6b7280', fontSize: 14 },
  missingText: { color: '#ef4444', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  errorBanner: { backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15 },
  errorText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 14 },
  errorSubText: { color: '#991b1b', fontSize: 12, marginTop: 4 }
});
