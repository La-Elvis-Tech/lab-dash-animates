
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  location: string;
  size?: string | null;
  expiryDate?: string | null;
  lastUsed: string;
  status: string;
  minStock: number;
  maxStock: number;
  reservedForAppointments: number;
  consumptionHistory: number[];
}

export interface InventoryCategory {
  id: string;
  name: string;
  icon?: any;
}

export const inventoryCategories: InventoryCategory[] = [
  { id: "all", name: "Todos" },
  { id: "reagents", name: "Reagentes" },
  { id: "glassware", name: "Vidraria" },
  { id: "equipment", name: "Equipamentos" },
  { id: "disposable", name: "Descartáveis" },
];

// API Functions using Supabase
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      id,
      name,
      current_stock,
      unit_measure,
      storage_location,
      expiry_date,
      min_stock,
      max_stock,
      updated_at,
      inventory_categories(name)
    `)
    .eq('active', true);

  if (error) throw error;

  return data?.map(item => ({
    id: item.id,
    name: item.name,
    category: item.inventory_categories?.name || 'outros',
    stock: item.current_stock,
    unit: item.unit_measure,
    location: item.storage_location || 'Não especificado',
    size: null,
    expiryDate: item.expiry_date,
    lastUsed: item.updated_at,
    status: item.current_stock <= item.min_stock ? 'low' : 'ok',
    minStock: item.min_stock,
    maxStock: item.max_stock || 100,
    reservedForAppointments: 0, // Será calculado via query separada
    consumptionHistory: [0, 0, 0, 0, 0, 0] // Histórico fictício - implementar via movimentações
  })) || [];
};

export const getInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('id, name');

  if (error) throw error;

  const categories = [{ id: "all", name: "Todos" }];
  if (data) {
    categories.push(...data.map(cat => ({
      id: cat.id,
      name: cat.name
    })));
  }

  return categories;
};

export const updateInventoryItem = async (itemId: string, updatedData: Partial<InventoryItem>): Promise<InventoryItem> => {
  const updateData: any = {};
  
  if (updatedData.stock !== undefined) updateData.current_stock = updatedData.stock;
  if (updatedData.minStock !== undefined) updateData.min_stock = updatedData.minStock;
  if (updatedData.maxStock !== undefined) updateData.max_stock = updatedData.maxStock;
  if (updatedData.location !== undefined) updateData.storage_location = updatedData.location;
  if (updatedData.expiryDate !== undefined) updateData.expiry_date = updatedData.expiryDate;

  const { data, error } = await supabase
    .from('inventory_items')
    .update(updateData)
    .eq('id', itemId)
    .select(`
      id,
      name,
      current_stock,
      unit_measure,
      storage_location,
      expiry_date,
      min_stock,
      max_stock,
      updated_at,
      inventory_categories(name)
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.inventory_categories?.name || 'outros',
    stock: data.current_stock,
    unit: data.unit_measure,
    location: data.storage_location || 'Não especificado',
    size: null,
    expiryDate: data.expiry_date,
    lastUsed: data.updated_at,
    status: data.current_stock <= data.min_stock ? 'low' : 'ok',
    minStock: data.min_stock,
    maxStock: data.max_stock || 100,
    reservedForAppointments: 0,
    consumptionHistory: [0, 0, 0, 0, 0, 0]
  };
};

export const reserveInventoryItem = async (itemId: string, quantity: number): Promise<InventoryItem> => {
  // Em produção, isso seria implementado via função do banco
  // Por enquanto, apenas atualizamos o estoque
  const { data: currentItem } = await supabase
    .from('inventory_items')
    .select('current_stock')
    .eq('id', itemId)
    .single();

  if (!currentItem) throw new Error('Item não encontrado');

  const newStock = currentItem.current_stock - quantity;
  
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ current_stock: newStock })
    .eq('id', itemId)
    .select(`
      id,
      name,
      current_stock,
      unit_measure,
      storage_location,
      expiry_date,
      min_stock,
      max_stock,
      updated_at,
      inventory_categories(name)
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.inventory_categories?.name || 'outros',
    stock: data.current_stock,
    unit: data.unit_measure,
    location: data.storage_location || 'Não especificado',
    size: null,
    expiryDate: data.expiry_date,
    lastUsed: data.updated_at,
    status: data.current_stock <= data.min_stock ? 'low' : 'ok',
    minStock: data.min_stock,
    maxStock: data.max_stock || 100,
    reservedForAppointments: quantity,
    consumptionHistory: [0, 0, 0, 0, 0, 0]
  };
};
