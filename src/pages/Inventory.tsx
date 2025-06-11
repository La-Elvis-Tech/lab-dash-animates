
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Calendar, Package, Database, Clock, Download, Upload, AlertTriangle, TrendingUp, Edit2, ShoppingCart, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Components
import InventoryStockHealth from "@/components/inventory/InventoryStockHealth";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryAddItemDialog from "@/components/inventory/InventoryAddItemDialog";
import InventoryExportDialog from "@/components/inventory/InventoryExportDialog";

// Mock data
const categories = [
  { id: "all", name: "Todos" },
  { id: "reagents", name: "Reagentes" },
  { id: "glassware", name: "Vidraria" },
  { id: "equipment", name: "Equipamentos" },
  { id: "disposable", name: "Descartáveis" },
  { id: "expiring", name: "Vencendo", icon: AlertTriangle },
];

const inventoryItems = [
  {
    id: 1,
    name: "Ácido Sulfúrico",
    category: "reagents",
    stock: 18,
    unit: "Litros",
    location: "Armário A3",
    size: null,
    expiryDate: "2025-10-15",
    lastUsed: "2023-04-10",
    status: "ok",
    minStock: 15,
    maxStock: 50,
    reservedForAppointments: 3,
    consumptionHistory: [12, 15, 18, 22, 20, 18],
  },
  {
    id: 2,
    name: "Placas de Petri",
    category: "disposable",
    stock: 35,
    unit: "Unidades",
    location: "Armário D2",
    size: null,
    expiryDate: "2025-08-22",
    lastUsed: "2023-04-15",
    status: "ok",
    minStock: 20,
    maxStock: 100,
    reservedForAppointments: 8,
    consumptionHistory: [25, 30, 35, 40, 38, 35],
  },
  {
    id: 3,
    name: "Etanol Absoluto",
    category: "reagents",
    stock: 3,
    unit: "Litros",
    location: "Armário A1",
    size: null,
    expiryDate: "2024-12-15",
    lastUsed: "2023-04-12",
    status: "low",
    minStock: 10,
    maxStock: 30,
    reservedForAppointments: 1,
    consumptionHistory: [8, 10, 6, 4, 3, 3],
  },
  {
    id: 4,
    name: "Balão Volumétrico",
    category: "glassware",
    stock: 12,
    unit: "Unidades",
    location: "Armário G4",
    size: "500ml",
    expiryDate: null,
    lastUsed: "2023-03-28",
    status: "ok",
    minStock: 5,
    maxStock: 20,
    reservedForAppointments: 2,
    consumptionHistory: [8, 10, 12, 14, 12, 12],
  },
  {
    id: 5,
    name: "Luvas de Nitrila (M)",
    category: "disposable",
    stock: 10,
    unit: "Pares",
    location: "Armário D1",
    size: null,
    expiryDate: "2024-07-18",
    lastUsed: "2023-04-18",
    status: "low",
    minStock: 50,
    maxStock: 200,
    reservedForAppointments: 5,
    consumptionHistory: [45, 50, 35, 25, 15, 10],
  },
  {
    id: 6,
    name: "Microscópio Óptico",
    category: "equipment",
    stock: 5,
    unit: "Unidades",
    location: "Sala E2",
    expiryDate: null,
    lastUsed: "2023-04-05",
    status: "ok",
    minStock: 3,
    maxStock: 8,
    reservedForAppointments: 0,
    consumptionHistory: [5, 5, 5, 5, 5, 5],
  },
  {
    id: 7,
    name: "Pipeta Graduada",
    category: "glassware",
    stock: 25,
    unit: "Unidades",
    location: "Armário G2",
    size: "10ml",
    expiryDate: null,
    lastUsed: "2023-04-14",
    status: "ok",
    minStock: 15,
    maxStock: 40,
    reservedForAppointments: 4,
    consumptionHistory: [20, 22, 25, 28, 26, 25],
  },
  {
    id: 8,
    name: "Tubos de Ensaio",
    category: "glassware",
    stock: 8,
    unit: "Unidades",
    location: "Armário G3",
    size: "15ml",
    expiryDate: null,
    lastUsed: "2023-04-16",
    status: "low",
    minStock: 20,
    maxStock: 60,
    reservedForAppointments: 2,
    consumptionHistory: [35, 30, 25, 20, 15, 8],
  },
];

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredItems, setFilteredItems] = useState(inventoryItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [items, setItems] = useState(inventoryItems);
  const containerRef = useRef(null);
  const { toast } = useToast();

  // Calculate expiring items (within 30 days)
  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  });

  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory === "expiring") {
      filtered = expiringItems;
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);

    // Animation when filter changes
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".inventory-item",
        { opacity: 0, x: 10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [searchQuery, selectedCategory, items, expiringItems]);

  useEffect(() => {
    // Initial animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".inventory-filters",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
      );

      gsap.fromTo(
        ".item-list",
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.05,
          delay: 0.2,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleUpdateItem = (itemId, updatedData) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, ...updatedData } : item
      )
    );
    
    toast({
      title: "Item atualizado",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const handleReserveItem = (itemId, quantity) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              reservedForAppointments: item.reservedForAppointments + quantity,
              stock: item.stock - quantity 
            } 
          : item
      )
    );
    
    toast({
      title: "Item reservado",
      description: `${quantity} unidades foram reservadas para agendamento.`,
    });
  };

  const handleRequestRestock = (itemId) => {
    const item = items.find(i => i.id === itemId);
    toast({
      title: "Solicitação enviada",
      description: `Solicitação de reposição para ${item?.name} foi enviada ao responsável.`,
    });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Inventário
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerencie os itens de laboratório com controle avançado
        </p>
      </div>

      {/* Dashboard de Saúde do Estoque */}
      <InventoryStockHealth items={items} expiringItems={expiringItems} />

      {/* Filters */}
      <Card className="inventory-filters">
        <CardContent className="p-4 bg-neutral-100/80 dark:bg-neutral-800/80">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-3 transform text-gray-400"
                size={18}
              />
              <Input
                placeholder="Buscar item..."
                className="pl-10 w-full rounded-md bg-white dark:bg-neutral-700/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start">
              {/* Category filter */}
              <div className="w-full sm:flex-1">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? "bg-lab-blue text-white dark:bg-lab-blue/80"
                          : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-neutral-700/80 dark:text-gray-300 dark:hover:bg-gray-700"
                      } rounded-md border border-gray-200 dark:border-gray-700 transition-colors`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.icon && <category.icon size={16} />}
                      {category.name}
                      {category.id === "expiring" && expiringItems.length > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          {expiringItems.length}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <InventoryExportDialog 
                  items={filteredItems}
                  isOpen={isExportDialogOpen}
                  setIsOpen={setIsExportDialogOpen}
                />
                
                <InventoryAddItemDialog 
                  isOpen={isAddDialogOpen}
                  setIsOpen={setIsAddDialogOpen}
                  categories={categories.filter(c => c.id !== "all" && c.id !== "expiring")}
                  onAddItem={(newItem) => {
                    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
                    toast({
                      title: "Item adicionado",
                      description: `${newItem.name} foi adicionado ao inventário.`,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 item-list">
        {filteredItems.map((item) => (
          <InventoryItemCard
            key={item.id}
            item={item}
            onUpdateItem={handleUpdateItem}
            onReserveItem={handleReserveItem}
            onRequestRestock={handleRequestRestock}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum item encontrado com os filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
