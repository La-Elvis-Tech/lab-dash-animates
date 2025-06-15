
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './useUserProfile';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  unit_id: string;
  sku?: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit_measure: string;
  cost_per_unit?: number;
  supplier?: string;
  storage_location?: string;
  expiry_date?: string;
  lot_number?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  inventory_categories?: {
    name: string;
    color: string;
    icon: string;
  };
  units?: {
    name: string;
    code: string;
  };
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  performed_by: string;
  created_at: string;
}

export const useSupabaseInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  const fetchItems = async () => {
    try {
      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories(name, color, icon),
          units(name, code)
        `)
        .eq('active', true);

      // Filtrar por unidade do usuário se disponível
      if (profile?.unit_id) {
        query = query.eq('unit_id', profile.unit_id);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do inventário.',
        variant: 'destructive',
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      let query = supabase
        .from('inventory_movements')
        .select('*');

      // Se o usuário tem unidade específica, filtrar movimentos dos itens da sua unidade
      if (profile?.unit_id) {
        const { data: userUnitItems } = await supabase
          .from('inventory_items')
          .select('id')
          .eq('unit_id', profile.unit_id);
        
        if (userUnitItems && userUnitItems.length > 0) {
          const itemIds = userUnitItems.map(item => item.id);
          query = query.in('item_id', itemIds);
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data || []);
    } catch (error: any) {
      console.error('Error fetching movements:', error);
    }
  };

  const createItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Se o usuário tem unidade atribuída, usar ela; senão usar a do item
      const unitId = profile?.unit_id || item.unit_id;

      const itemData = {
        ...item,
        unit_id: unitId,
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchItems();
      
      toast({
        title: 'Item criado',
        description: `${item.name} foi adicionado ao inventário.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o item.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchItems();
      
      toast({
        title: 'Item atualizado',
        description: 'As informações foram salvas com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      
      await fetchItems();
      
      toast({
        title: 'Item removido',
        description: 'O item foi removido do inventário.',
      });
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o item.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at' | 'performed_by'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const movementData = {
        ...movement,
        performed_by: userData.user.id,
      };

      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([movementData])
        .select()
        .single();

      if (error) throw error;

      // Atualizar estoque do item
      const item = items.find(i => i.id === movement.item_id);
      if (item) {
        const newStock = movement.movement_type === 'in' 
          ? item.current_stock + movement.quantity
          : item.current_stock - movement.quantity;

        await updateItem(movement.item_id, { current_stock: Math.max(0, newStock) });
      }
      
      await fetchMovements();
      
      toast({
        title: 'Movimentação registrada',
        description: 'A movimentação foi registrada com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error adding movement:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a movimentação.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getLowStockItems = () => {
    return items.filter(item => item.current_stock <= item.min_stock);
  };

  const getExpiringItems = (days: number = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= futureDate;
    });
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => {
      return total + (item.current_stock * (item.cost_per_unit || 0));
    }, 0);
  };

  useEffect(() => {
    const loadData = async () => {
      if (profile !== null) { // Wait for profile to be loaded (even if null)
        setLoading(true);
        await Promise.all([
          fetchItems(),
          fetchCategories(),
          fetchMovements()
        ]);
        setLoading(false);
      }
    };

    loadData();
  }, [profile]);

  return {
    items,
    categories,
    movements,
    loading,
    createItem,
    updateItem,
    deleteItem,
    addMovement,
    getLowStockItems,
    getExpiringItems,
    getTotalValue,
    refreshItems: fetchItems,
    refreshCategories: fetchCategories,
    refreshMovements: fetchMovements,
    userUnit: profile?.unit
  };
};
