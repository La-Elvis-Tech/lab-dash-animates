
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit?: number;
  supplier?: string;
  lot_number?: string;
  expiry_date?: string;
  location?: string;
  active: boolean;
  unit_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    description?: string;
  };
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost: number;
  total_cost: number;
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
  const [userUnit, setUserUnit] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  // Função para obter a unidade do usuário
  const getUserUnit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('unit_id, units(id, name)')
        .eq('id', userData.user.id)
        .single();

      if (profile?.units) {
        return {
          id: profile.units.id,
          name: profile.units.name
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user unit:', error);
      return null;
    }
  };

  const fetchItems = async () => {
    try {
      const unit = await getUserUnit();
      if (!unit) return;

      setUserUnit(unit);

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          categories(name, description)
        `)
        .eq('unit_id', unit.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error fetching items:', error);
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
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      const unit = await getUserUnit();
      if (!unit) return;

      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('unit_id', unit.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Type conversion to ensure movement_type is correct
      const typedMovements: InventoryMovement[] = (data || []).map(movement => ({
        ...movement,
        movement_type: movement.movement_type as 'in' | 'out' | 'adjustment' | 'transfer'
      }));
      
      setMovements(typedMovements);
    } catch (error: any) {
      console.error('Error fetching movements:', error);
    }
  };

  const createItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const unit = await getUserUnit();
      if (!unit) throw new Error('Unidade do usuário não encontrada');

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{ ...item, unit_id: unit.id }])
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

  const addMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at'>) => {
    try {
      const unit = await getUserUnit();
      if (!unit) throw new Error('Unidade do usuário não encontrada');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([{
          ...movement,
          unit_id: unit.id,
          performed_by: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await Promise.all([fetchItems(), fetchMovements()]);
      
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchItems(),
        fetchCategories(),
        fetchMovements()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    items,
    categories,
    movements,
    loading,
    userUnit: userUnit || { id: '', name: 'Unidade não encontrada' },
    createItem,
    updateItem,
    deleteItem,
    addMovement,
    refreshItems: fetchItems,
    refreshCategories: fetchCategories,
    refreshMovements: fetchMovements,
  };
};
