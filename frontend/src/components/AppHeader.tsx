import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme/tokens';
import { CurvedHeaderBackground } from './CurvedHeaderBackground';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  pantryCount?: number;
  onPantryPress?: () => void;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  pantryCount,
  onPantryPress,
  rightAction,
  children,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <CurvedHeaderBackground curveRadius={radius.xxl} style={styles.header}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.inner, { paddingTop: Math.max(insets.top, 14) }]}>
        {/* Top Bar Row */}
        <View style={styles.topRow}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.circleBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.8}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderBtn} />
          )}

          <View style={styles.titleContainer}>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {rightAction ? (
            rightAction
          ) : onPantryPress ? (
            <TouchableOpacity
              onPress={onPantryPress}
              style={styles.circleBtn}
              accessibilityRole="button"
              accessibilityLabel="View digital pantry"
              activeOpacity={0.8}
            >
              <Text style={styles.pantryIcon}>🥫</Text>
              {pantryCount !== undefined && pantryCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pantryCount > 99 ? '99+' : pantryCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderBtn} />
          )}
        </View>

        {/* Optional Embedded Content (Tabs, SearchBar) */}
        {children && <View style={styles.childrenArea}>{children}</View>}
      </View>
    </CurvedHeaderBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.md,
  },
  inner: {
    paddingHorizontal: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },
  backArrow: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  pantryIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '900',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.cream,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
    opacity: 0.9,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  childrenArea: {
    marginTop: spacing.sm,
  },
});
