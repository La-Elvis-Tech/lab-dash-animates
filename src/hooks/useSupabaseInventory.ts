
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryCategory } from '@/data/inventory';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      const allCategories = [
        { id: 'all', name: 'Todos' },
        ...(data?.map(cat => ({
          id: cat.id,
          name: cat.name
        })) || [])
      ];

      setCategories(allCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories(name, color)
        `)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      const mappedItems: InventoryItem[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.inventory_categories?.name || 'Sem categoria',
        stock: item.current_stock,
        unit: item.unit_measure,
        minStock: item.min_stock,
        maxStock: item.max_stock || 0,
        price: item.cost_per_unit || 0,
        supplier: item.supplier || 'N/A',
        location: item.storage_location || 'N/A',
        expiryDate: item.expiry_date,
        lastUpdated: item.updated_at,
        status: getItemStatus(item),
        reservedForAppointments: 0,
        lastUsed: item.updated_at
      })) || [];

      setItems(mappedItems);
    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do inventário.',
        variant: 'destructive',
      });
    }
  };

  const getItemStatus = (item: any): 'active' | 'low' | 'critical' | 'expired' => {
    // Check if expired
    if (item.expiry_date && new Date(item.expiry_date) < new Date()) {
      return 'expired';
    }
    
    // Check stock levels
    if (item.current_stock <= 0) {
      return 'critical';
    } else if (item.current_stock <= item.min_stock) {
      return 'low';
    }
    
    return 'active';
  };

  const updateItem = async (itemId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Item atualizado',
        description: 'O item foi atualizado com sucesso.',
      });
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

  const reserveItem = async (itemId: string, quantity: number) => {
    try {
      // This would implement the reservation logic
      console.log(`Reserving ${quantity} of item ${itemId}`);
      
      toast({
        title: 'Item reservado',
        description: `${quantity} unidades foram reservadas.`,
      });
    } catch (error: any) {
      console.error('Error reserving item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reservar o item.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ active: false })
        .eq('id', itemId);

      if (error) throw error;

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

  const refreshItems = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchItems()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshItems();
  }, []);

  return {
    items,
    categories,
    loading,
    updateItem,
    reserveItem,
    deleteItem,
    refreshItems,
  };
};
