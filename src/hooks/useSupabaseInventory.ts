
import { useInventoryData } from './useInventoryData';
import { useInventoryActions } from './useInventoryActions';

export const useSupabaseInventory = () => {
  const { items, categories, loading, userUnit, refreshItems } = useInventoryData();
  const { addItem, updateItem, deleteItem } = useInventoryActions(userUnit, refreshItems);

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
