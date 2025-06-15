
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryCategory, InventoryMovement, UserUnit } from '@/types/inventory';

export const getUserUnit = async (): Promise<UserUnit | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('unit_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.unit_id) return null;

    const { data: unit } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', profile.unit_id)
      .single();

    if (unit) {
      return {
        id: unit.id,
        name: unit.name
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user unit:', error);
    return null;
  }
};

export const fetchInventoryItems = async (unitId: string): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      categories:inventory_categories(name, description)
    `)
    .eq('unit_id', unitId)
    .eq('active', true)
    .order('name');

  if (error) throw error;
  
  return (data || []).map(item => ({
    ...item,
    unit: item.unit_measure,
    location: item.storage_location || 'N/A',
    categories: item.categories || undefined
  }));
};

export const fetchInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  
  return (data || []).map(category => ({
    ...category,
    active: true,
    updated_at: category.created_at
  }));
};

export const fetchInventoryMovements = async (unitId: string): Promise<InventoryMovement[]> => {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  
  return (data || []).map(movement => ({
    ...movement,
    movement_type: movement.movement_type as 'in' | 'out' | 'adjustment' | 'transfer'
  }));
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>, unitId: string) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([{ 
      ...item, 
      unit_id: unitId,
      unit_measure: item.unit,
      storage_location: item.location
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
  const dbUpdates = {
    ...updates,
    unit_measure: updates.unit,
    storage_location: updates.location
  };
  
  // Remove frontend-only fields
  delete dbUpdates.unit;
  delete dbUpdates.location;
  delete dbUpdates.categories;

  const { data, error } = await supabase
    .from('inventory_items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory_items')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
};

export const addInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at'>) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([{
      ...movement,
      performed_by: userData.user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
