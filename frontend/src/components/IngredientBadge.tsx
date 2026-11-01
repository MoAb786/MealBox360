import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface IngredientBadgeProps {
  name: string;
  status?: 'available' | 'missing' | 'staple' | 'use_soon' | 'fresh' | 'expired';
  quantity?: number | null;
  unit?: string | null;
}

export const IngredientBadge: React.FC<IngredientBadgeProps> = ({
  name,
  status = 'available',
  quantity,
  unit,
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'available':
        return { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' };
      case 'missing':
        return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
      case 'use_soon':
        return { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' };
      case 'expired':
        return { bg: '#fbe9e7', text: '#d84315', border: '#ffab91' };
      case 'staple':
        return { bg: '#ede7f6', text: '#512da8', border: '#d1c4e9' };
      default:
        return { bg: '#f5f5f5', text: '#616161', border: '#e0e0e0' };
    }
  };

  const style = getBadgeStyle();
  const qtyStr = quantity ? ` (${quantity}${unit ? ' ' + unit : ''})` : '';

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>
        {status === 'available' && '✓ '}
        {status === 'missing' && '✕ '}
        {status === 'use_soon' && '⏳ '}
        {status === 'expired' && '⚠️ '}
        {name}
        {qtyStr}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
