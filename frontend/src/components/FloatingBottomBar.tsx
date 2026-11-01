import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, radius, shadows, spacing } from '../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FloatingBottomBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const getIcon = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case 'HomeTab':
        return '🏠';
      case 'PantryTab':
        return '🥫';
      case 'DiscoverTab':
        return '🍳';
      case 'HistoryTab':
        return '📅';
      case 'ProfileTab':
        return '👤';
      default:
        return '🍴';
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'HomeTab':
        return 'Home';
      case 'PantryTab':
        return 'Pantry';
      case 'DiscoverTab':
        return 'Discover';
      case 'HistoryTab':
        return 'History';
      case 'ProfileTab':
        return 'Profile';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                {getIcon(route.name, isFocused)}
              </Text>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {getLabel(route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,          // 28px pill
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  tabItemActive: {
    backgroundColor: 'rgba(74,107,58,0.10)',  // primarySoft
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.textMuted,
  },
});
