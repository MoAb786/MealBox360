import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { PantryScreen } from '../screens/PantryScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let icon = '🍴';
          if (route.name === 'HomeTab') icon = '🏠';
          if (route.name === 'PantryTab') icon = '🥫';
          if (route.name === 'DiscoverTab') icon = '🍳';
          if (route.name === 'HistoryTab') icon = '📅';
          if (route.name === 'ProfileTab') icon = '👤';
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: '#0288d1',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 1,
          shadowOpacity: 0.05,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#0f172a',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', headerTitle: 'MealBox360 🥫' }}
      />
      <Tab.Screen
        name="PantryTab"
        component={PantryScreen}
        options={{ title: 'My Pantry', headerTitle: 'Digital Pantry' }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{ title: 'Discover', headerTitle: 'Recipe Recommendations' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{ title: 'History', headerTitle: 'Meal History' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', headerTitle: 'My Profile & Diets' }}
      />
    </Tab.Navigator>
  );
};
