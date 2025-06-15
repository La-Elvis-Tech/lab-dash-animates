import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, Plus, Trash } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useToast } from '@/hooks/use-toast';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import LowStockAlert from '@/components/inventory/LowStockAlert';

const Inventory = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  const { 
    items: inventoryItems, 
    categories, 
    loading, 
    userUnit,
    addItem,
    updateItem, 
    deleteItem, 
    refreshItems 
  } = useSupabaseInventory();

  const { toast } = useToast();
  const { sendEmailForAlert } = useAlerts();

  // Remove duplicates based on name and unit_id
  const uniqueItems = inventoryItems.filter((item, index, self) => 
    index === self.findIndex((i) => i.name === item.name && i.unit_id === item.unit_id)
  );

  const filteredItems = uniqueItems.filter(item => {
    const categoryName = item.categories?.name || 'Sem categoria';
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = uniqueItems.filter(item => item.current_stock <= item.min_stock);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    for (const itemId of selectedItems) {
      await deleteItem(itemId);
    }
    setSelectedItems(new Set());
    refreshItems();
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados do inventário estão sendo exportados."
    });
    setShowExportDialog(false);
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    refreshItems();
    toast({
      title: "Item adicionado",
      description: "O item foi adicionado ao inventário com sucesso."
    });
  };

  const handleUpdateSuccess = () => {
    refreshItems();
    toast({
      title: "Item atualizado",
      description: "O item foi atualizado com sucesso."
    });
  };

  const handleLowStockAlert = (item: any) => {
    sendEmailForAlert({
      id: `stock-${item.id}`,
      type: "stock",
      priority: "high",
      title: `Estoque Baixo - ${item.name}`,
      description: `Apenas ${item.current_stock} ${item.unit} restantes (mínimo: ${item.min_stock})`,
      item: item.name,
      currentStock: item.current_stock,
      minStock: item.min_stock,
      unit: item.unit,
      createdAt: new Date(),
      status: "active",
      isRead: false
    });
  };

  if (!userUnit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Unidade não encontrada
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Você precisa estar associado a uma unidade para acessar o inventário.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InventoryHeader
        unitName={userUnit.name}
        categories={categories}
        onAddSuccess={handleAddSuccess}
        onExport={handleExport}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showExportDialog={showExportDialog}
        setShowExportDialog={setShowExportDialog}
      />

      <LowStockAlert lowStockItems={lowStockItems} />

      <InventoryStats items={uniqueItems} />

      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md">
          <span className="text-sm font-medium ml-2">
            {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'itens'} selecionados
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedItems(new Set())}
            >
              Limpar
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-neutral-500" />
            <p className="mt-2 text-neutral-500">Carregando inventário...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-10 w-10 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Nenhum item encontrado
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mt-2">
              {searchTerm 
                ? `Não encontramos itens correspondentes à sua busca "${searchTerm}".` 
                : "Não há itens no inventário para esta categoria."}
            </p>
            <Button 
              className="mt-4"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <InventoryTable 
          items={filteredItems}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onUpdateSuccess={handleUpdateSuccess}
          onLowStockAlert={handleLowStockAlert}
        />
      )}
    </div>
  );
};

export default Inventory;
