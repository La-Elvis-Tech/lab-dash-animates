import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, ArrowDownUp, ArrowUpDown, Check, Download, Filter, Loader2, Plus, Search, Trash } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryStats from '@/components/inventory/InventoryStats';
import { InventoryCategory } from '@/data/inventory';
import { useToast } from '@/hooks/use-toast';
import { useAlerts } from '@/hooks/useAlerts';

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
    updateItem, 
    reserveItem, 
    deleteItem, 
    refreshItems 
  } = useSupabaseInventory();

  const { toast } = useToast();
  const { sendEmailForAlert } = useAlerts();

  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
    // Implement export functionality
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
      description: `Apenas ${item.stock} ${item.unit} restantes (mínimo: ${item.minStock})`,
      item: item.name,
      currentStock: item.stock,
      minStock: item.minStock,
      unit: item.unit,
      createdAt: new Date(),
      status: "active",
      isRead: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Inventário
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie o estoque de materiais e reagentes
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-lab-blue hover:bg-lab-blue/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do novo item a ser adicionado ao inventário.
                </DialogDescription>
              </DialogHeader>
              <InventoryForm onSuccess={handleAddSuccess} categories={categories} />
            </DialogContent>
          </Dialog>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Inventário</DialogTitle>
                <DialogDescription>
                  Escolha o formato para exportar os dados do inventário.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button onClick={handleExport} className="w-full">
                  Exportar como CSV
                </Button>
                <Button onClick={handleExport} className="w-full">
                  Exportar como Excel
                </Button>
                <Button onClick={handleExport} className="w-full">
                  Exportar como PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStats items={inventoryItems} />

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Buscar por nome, categoria ou fornecedor..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Tabs 
            defaultValue="all" 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-neutral-100 dark:bg-neutral-800 h-10">
              {categories.map((category: InventoryCategory) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Selected Items Actions */}
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

      {/* Inventory Table */}
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
          onReserveItem={reserveItem}
          onDeleteItem={deleteItem}
          onUpdateSuccess={handleUpdateSuccess}
          onLowStockAlert={handleLowStockAlert}
        />
      )}
    </div>
  );
};

export default Inventory;
