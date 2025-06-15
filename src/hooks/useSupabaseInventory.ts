
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryCategory } from '@/types/inventory';
import { getUserUnit, fetchInventoryItems, fetchInventoryCategories, createInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryMovement } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUnit, setUserUnit] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const loadUserUnit = useCallback(async () => {
    try {
      const unit = await getUserUnit();
      setUserUnit(unit);
      return unit;
    } catch (error) {
      console.error('Error loading user unit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar informações da unidade do usuário.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const loadItems = useCallback(async (unitId: string) => {
    try {
      setLoading(true);
      const inventoryItems = await fetchInventoryItems(unitId);
      setItems(inventoryItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens do inventário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      const inventoryCategories = await fetchInventoryCategories();
      setCategories(inventoryCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const refreshItems = useCallback(async () => {
    if (userUnit?.id) {
      await loadItems(userUnit.id);
    }
  }, [userUnit?.id, loadItems]);

  const addItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userUnit?.id) {
      toast({
        title: 'Erro',
        description: 'Unidade do usuário não encontrada.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createInventoryItem(item, userUnit.id);
      
      // Registrar movimento de entrada
      await addInventoryMovement({
        item_id: '', // Será preenchido pelo backend
        movement_type: 'in',
        quantity: item.current_stock,
        unit_cost: item.cost_per_unit || 0,
        total_cost: (item.current_stock * (item.cost_per_unit || 0)),
        reason: 'Adição inicial de item ao inventário',
        reference_type: 'manual',
        performed_by: '' // Será preenchido pelo backend
      });

      await refreshItems();
      
      toast({
        title: 'Sucesso',
        description: 'Item adicionado ao inventário com sucesso.',
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item ao inventário.',
        variant: 'destructive',
      });
    }
  }, [userUnit?.id, refreshItems, toast]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateInventoryItem(id, updates);
      
      // Se o estoque foi atualizado, registrar movimento
      if (updates.current_stock !== undefined) {
        const currentItem = items.find(item => item.id === id);
        if (currentItem) {
          const stockDifference = updates.current_stock - currentItem.current_stock;
          if (stockDifference !== 0) {
            await addInventoryMovement({
              item_id: id,
              movement_type: stockDifference > 0 ? 'in' : 'out',
              quantity: Math.abs(stockDifference),
              unit_cost: currentItem.cost_per_unit || 0,
              total_cost: Math.abs(stockDifference) * (currentItem.cost_per_unit || 0),
              reason: 'Ajuste manual de estoque',
              reference_type: 'manual',
              performed_by: '' // Será preenchido pelo backend
            });
          }
        }
      }

      await refreshItems();
      
      toast({
        title: 'Sucesso',
        description: 'Item atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
    }
  }, [items, refreshItems, toast]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteInventoryItem(id);
      await refreshItems();
      
      toast({
        title: 'Sucesso',
        description: 'Item removido do inventário.',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o item.',
        variant: 'destructive',
      });
    }
  }, [refreshItems, toast]);

  useEffect(() => {
    const initializeData = async () => {
      const unit = await loadUserUnit();
      if (unit?.id) {
        await Promise.all([
          loadItems(unit.id),
          loadCategories()
        ]);
      }
    };

    initializeData();
  }, [loadUserUnit, loadItems, loadCategories]);

  return {
    items,
    categories,
    loading,
    userUnit,
    addItem,
    updateItem,
    deleteItem,
    refreshItems
  };
};
