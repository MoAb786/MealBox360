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
  Platform,
} from 'react-native';
import { getPantryItems, addPantryItem, deletePantryItem, updatePantryItem } from '../api/pantry';
import { PantryItem } from '../types';
import { IngredientBadge } from '../components/IngredientBadge';
import { EmptyState } from '../components/EmptyState';

const CATEGORIES = ['All', 'vegetable', 'grain', 'protein', 'dairy', 'spice', 'oil', 'other'];

export const PantryScreen = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDays, setExpiryDays] = useState(''); // e.g. "5" for expires in 5 days
  const [submitting, setSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPantryItems(selectedCategory === 'All' ? undefined : selectedCategory);
      setItems(data);
    } catch (err: any) {
      console.error('Error fetching pantry:', err);
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
    Alert.alert('Remove Ingredient', `Remove "${item.display_name}" from pantry?`, [
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
      {/* Search & Add bar */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search pantry..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
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
          <ActivityIndicator size="large" color="#0288d1" />
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="🥫"
          title="Your Pantry is Empty"
          description="Add everyday ingredients like onions, rice, dal or eggs to get instant meal ideas!"
          buttonTitle="+ Add Your First Ingredient"
          onButtonPress={openAddModal}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
              {editingItem ? 'Edit Ingredient' : 'Add to Pantry'}
            </Text>

            <Text style={styles.modalLabel}>Ingredient Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Tomato, Rice, Eggs"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalLabel}>Quantity (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 500"
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
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <Text style={styles.modalLabel}>Expires in (Days from now - optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 3 for three days"
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
                style={[styles.saveBtn, submitting && styles.btnDisabled]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
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
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  topBar: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#0288d1',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  chipsContainer: { marginBottom: 12 },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: { backgroundColor: '#0288d1', borderColor: '#0288d1' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  chipTextSelected: { color: '#ffffff', fontWeight: 'bold' },
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 30 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  qtyText: { fontSize: 13, color: '#64748b', marginRight: 8, fontWeight: '500' },
  expiryFresh: { fontSize: 11, color: '#94a3b8' },
  itemActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  iconBtnText: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  rowInputs: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#0288d1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold' },
  btnDisabled: { opacity: 0.7 },
});
