
import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, InventoryCategory } from '@/types/inventory';
import { getUserUnit, fetchInventoryItems, fetchInventoryCategories } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

export const useInventoryData = () => {
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
    refreshItems
  };
};
