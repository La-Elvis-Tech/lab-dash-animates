
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string; // Changed from number to string to match Supabase UUID
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  maxStock?: number;
  price: number;
  supplier: string;
  location: string;
  expiryDate?: string;
  lastUpdated: string;
  status: 'active' | 'low' | 'critical' | 'expired';
  reservedForAppointments: number;
  lastUsed?: string;
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
      *,
      inventory_categories(name, color)
    `)
    .eq('active', true);

  if (error) throw error;

  return data?.map(item => ({
    id: item.id,
    name: item.name,
    category: item.inventory_categories?.name || 'Sem categoria',
    stock: item.current_stock,
    unit: item.unit_measure,
    minStock: item.min_stock,
    maxStock: item.max_stock,
    price: item.cost_per_unit || 0,
    supplier: item.supplier || 'N/A',
    location: item.storage_location || 'N/A',
    expiryDate: item.expiry_date,
    lastUpdated: item.updated_at,
    status: item.current_stock <= item.min_stock ? 'critical' : 'active',
    reservedForAppointments: 0,
    lastUsed: item.updated_at
  })) || [];
};

export const getInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*');

  if (error) throw error;

  return data?.map(category => ({
    id: category.id,
    name: category.name
  })) || [];
};

export const updateInventoryItem = async (itemId: string, updatedData: any) => {
  const { error } = await supabase
    .from('inventory_items')
    .update(updatedData)
    .eq('id', itemId);

  if (error) throw error;
};

export const reserveInventoryItem = async (itemId: string, quantity: number) => {
  console.log(`Reserving ${quantity} of item ${itemId}`);
};
