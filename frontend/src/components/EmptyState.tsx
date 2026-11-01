import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🥫',
  title,
  description,
  buttonTitle,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonTitle && onButtonPress ? (
        <TouchableOpacity style={styles.button} onPress={onButtonPress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,         // 18px
    marginVertical: 15,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.subtle,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.xl,         // pill CTA
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
