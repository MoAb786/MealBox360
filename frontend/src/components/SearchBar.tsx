import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onChangeText,
  onPress,
  editable = true,
  style,
  containerStyle,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && editable && (
        <TouchableOpacity
          onPress={() => onChangeText?.('')}
          style={styles.clearBtn}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!editable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={containerStyle}
        accessibilityRole="search"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,         // pill feel per design system
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.divider,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
});
