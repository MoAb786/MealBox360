import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { IngredientBrowserScreen } from '../screens/IngredientBrowserScreen';
import { IngredientDetailScreen } from '../screens/IngredientDetailScreen';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.page }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="IngredientBrowser" component={IngredientBrowserScreen} />
          <Stack.Screen name="IngredientDetail" component={IngredientDetailScreen} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
