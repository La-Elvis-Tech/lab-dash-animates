
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseInventoryItem {
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
    icon?: string;
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
  icon?: string;
}

export const useSupabaseInventory = () => {
  const [items, setItems] = useState<SupabaseInventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories(name, color, icon),
          units(name, code)
        `)
        .eq('active', true)
        .order('name');

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
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    }
  };

  const addItem = async (item: Omit<SupabaseInventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      
      await fetchItems(); // Refresh the list
      
      toast({
        title: 'Item adicionado',
        description: `${item.name} foi adicionado ao inventário.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<SupabaseInventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchItems(); // Refresh the list
      
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
      
      await fetchItems(); // Refresh the list
      
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

  const createMovement = async (movement: {
    item_id: string;
    movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    reason?: string;
    unit_cost?: number;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const movementData = {
        ...movement,
        performed_by: userData.user.id,
        total_cost: movement.unit_cost ? movement.unit_cost * movement.quantity : null,
      };

      const { error } = await supabase
        .from('inventory_movements')
        .insert([movementData]);

      if (error) throw error;

      // Update current stock
      const currentItem = items.find(item => item.id === movement.item_id);
      if (currentItem) {
        const stockChange = movement.movement_type === 'in' || movement.movement_type === 'adjustment' 
          ? movement.quantity 
          : -movement.quantity;
        
        const newStock = currentItem.current_stock + stockChange;
        
        await updateItem(movement.item_id, { current_stock: newStock });
      }

      toast({
        title: 'Movimentação registrada',
        description: 'A movimentação foi registrada com sucesso.',
      });
    } catch (error: any) {
      console.error('Error creating movement:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a movimentação.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchCategories()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    items,
    categories,
    loading,
    addItem,
    updateItem,
    deleteItem,
    createMovement,
    refreshItems: fetchItems,
    refreshCategories: fetchCategories,
  };
};
