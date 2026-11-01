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
        return { bg: 'rgba(74,107,58,0.10)', text: '#4A6B3A', border: 'rgba(74,107,58,0.25)' };
      case 'missing':
        return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
      case 'use_soon':
        return { bg: 'rgba(232,193,50,0.18)', text: '#7A5A00', border: 'rgba(232,193,50,0.45)' };
      case 'expired':
        return { bg: '#fbe9e7', text: '#d84315', border: '#ffab91' };
      case 'staple':
        return { bg: '#EBEBE6', text: '#6B6B65', border: '#DDDDD5' };
      default:
        return { bg: '#EBEBE6', text: '#6B6B65', border: '#DDDDD5' };
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
    borderRadius: 8,               // --radius-sm
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
