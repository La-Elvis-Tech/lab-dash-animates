
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, InventoryCategory, InventoryMovement, UserUnit } from '@/types/inventory';
import {
  getUserUnit,
  fetchInventoryItems,
  fetchInventoryCategories,
  fetchInventoryMovements,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addInventoryMovement
} from '@/services/inventoryService';

export const useSupabaseInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUnit, setUserUnit] = useState<UserUnit | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const unit = await getUserUnit();
      if (!unit) return;

      setUserUnit(unit);
      const data = await fetchInventoryItems(unit.id);
      setItems(data);
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
      const data = await fetchInventoryCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      const unit = await getUserUnit();
      if (!unit) return;

      const data = await fetchInventoryMovements(unit.id);
      setMovements(data);
    } catch (error: any) {
      console.error('Error fetching movements:', error);
    }
  };

  const createItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const unit = await getUserUnit();
      if (!unit) throw new Error('Unidade do usuário não encontrada');

      await createInventoryItem(item, unit.id);
      await fetchItems();
      
      toast({
        title: 'Item criado',
        description: `${item.name} foi adicionado ao inventário.`,
      });
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
      await updateInventoryItem(id, updates);
      await fetchItems();
      
      toast({
        title: 'Item atualizado',
        description: 'As informações foram salvas com sucesso.',
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

  const deleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
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
      await addInventoryMovement(movement);
      await Promise.all([fetchItems(), fetchMovements()]);
      
      toast({
        title: 'Movimentação registrada',
        description: 'A movimentação foi registrada com sucesso.',
      });
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
