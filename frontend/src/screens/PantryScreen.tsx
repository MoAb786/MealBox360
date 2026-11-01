import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/tokens';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { IngredientBadge } from '../components/IngredientBadge';
import { EmptyState } from '../components/EmptyState';
import { getPantryItems, addPantryItem, deletePantryItem, updatePantryItem } from '../api/pantry';
import { PantryItem } from '../types';

const CATEGORIES = ['All', 'vegetable', 'grain', 'protein', 'dairy', 'spice', 'other'];

export const PantryScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPantryItems(selectedCategory === 'All' ? undefined : selectedCategory);
      setItems(data);
    } catch (err: any) {
      console.warn('Error fetching pantry:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setQuantity('');
    setUnit('');
    setCategory('');
    setExpiryDays('');
    setModalVisible(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setName(item.display_name);
    setQuantity(item.quantity ? String(item.quantity) : '');
    setUnit(item.unit || '');
    setCategory(item.category || '');
    if (item.expiry_date) {
      const diffDays = Math.ceil(
        (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      setExpiryDays(diffDays > 0 ? String(diffDays) : '0');
    } else {
      setExpiryDays('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an ingredient name.');
      return;
    }
    setSubmitting(true);
    try {
      let expiryDate: string | null = null;
      if (expiryDays.trim()) {
        const days = parseInt(expiryDays.trim(), 10);
        if (!isNaN(days)) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          expiryDate = d.toISOString().split('T')[0];
        }
      }

      const qty = quantity.trim() ? parseFloat(quantity.trim()) : null;

      if (editingItem) {
        await updatePantryItem(editingItem.id, {
          display_name: name.trim(),
          quantity: qty,
          unit: unit.trim() || null,
          category: category.trim() || null,
          expiry_date: expiryDate,
        });
      } else {
        await addPantryItem({
          display_name: name.trim(),
          quantity: qty,
          unit: unit.trim() || null,
          category: category.trim() || null,
          expiry_date: expiryDate,
        });
      }
      setModalVisible(false);
      loadItems();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save ingredient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: PantryItem) => {
    Alert.alert('Remove Ingredient', `Remove "${item.display_name}" from your pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePantryItem(item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Could not delete item');
          }
        },
      },
    ]);
  };

  const filteredItems = items.filter((i) =>
    i.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Curved Forest Header */}
      <AppHeader
        title="Digital Pantry"
        subtitle={`${items.length} items on hand`}
        pantryCount={items.length}
      />

      {/* Top Search & Actions */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search pantry items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          contentContainerStyle={{ paddingHorizontal: spacing.gutter }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedCategory === item && styles.chipSelected,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === item && styles.chipTextSelected,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centerArea}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="🥫"
          title="Your Pantry is Empty"
          description="Add everyday ingredients like onions, rice, dal or eggs to get instant recipe recommendations!"
          buttonTitle="+ Add Your First Ingredient"
          onButtonPress={openAddModal}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.display_name}</Text>
                <View style={styles.badgeRow}>
                  {item.quantity ? (
                    <Text style={styles.qtyText}>
                      {item.quantity} {item.unit || ''}
                    </Text>
                  ) : null}
                  {item.expiry_status === 'use_soon' && (
                    <IngredientBadge name="Expires Soon" status="use_soon" />
                  )}
                  {item.expiry_status === 'expired' && (
                    <IngredientBadge name="Expired" status="expired" />
                  )}
                  {item.expiry_date && item.expiry_status === 'fresh' && (
                    <Text style={styles.expiryFresh}>Exp: {item.expiry_date}</Text>
                  )}
                </View>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                  <Text style={styles.iconBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                  <Text style={styles.iconBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Pantry Item' : 'Add to Pantry'}
            </Text>

            <Text style={styles.modalLabel}>Ingredient Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Tomatoes, Basmati Rice, Eggs"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalLabel}>Quantity (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 500"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Unit (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="g, kg, cup, pcs"
                  placeholderTextColor={colors.muted}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <Text style={styles.modalLabel}>Expires in (Days from now - optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 3 for three days"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={expiryDays}
              onChangeText={setExpiryDays}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    marginTop: -16,
    marginBottom: 12,
    zIndex: 10,
    gap: 8,
  },
  addBtn: {
    backgroundColor: colors.primary,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radius.xl,           // pill CTA
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  chipsRow: {
    marginBottom: 12,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 90,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  qtyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
    fontWeight: '600',
  },
  expiryFresh: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
  },
  iconBtnText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 26, 0.50)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 22,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: radius.sm,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: colors.bg,
    color: colors.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
