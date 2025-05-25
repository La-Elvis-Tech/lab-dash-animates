import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Calendar, Package, Database, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Mock data
const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'reagents', name: 'Reagentes' },
  { id: 'glassware', name: 'Vidraria' },
  { id: 'equipment', name: 'Equipamentos' },
  { id: 'disposable', name: 'Descartáveis' },
];

const inventoryItems = [
  {
    id: 1,
    name: 'Ácido Sulfúrico',
    category: 'reagents',
    stock: 18,
    unit: 'Litros',
    location: 'Armário A3',
    size: null,
    expiryDate: '2025-10-15',
    lastUsed: '2023-04-10',
    status: 'ok'
  },
  {
    id: 2,
    name: 'Placas de Petri',
    category: 'disposable',
    stock: 35,
    unit: 'Unidades',
    location: 'Armário D2',
    size: null,
    expiryDate: '2025-08-22',
    lastUsed: '2023-04-15', 
    status: 'ok'
  },
  {
    id: 3,
    name: 'Etanol Absoluto',
    category: 'reagents',
    stock: 3,
    unit: 'Litros',
    location: 'Armário A1',
    size: null,
    expiryDate: '2025-12-30',
    lastUsed: '2023-04-12',
    status: 'low'
  },
  {
    id: 4,
    name: 'Balão Volumétrico',
    category: 'glassware',
    stock: 12,
    unit: 'Unidades',
    location: 'Armário G4',
    size: '500ml',
    expiryDate: null,
    lastUsed: '2023-03-28',
    status: 'ok'
  },
  {
    id: 5,
    name: 'Luvas de Nitrila (M)',
    category: 'disposable',
    stock: 10,
    unit: 'Pares',
    location: 'Armário D1',
    size: null,
    expiryDate: '2024-07-18',
    lastUsed: '2023-04-18',
    status: 'low'
  },
  {
    id: 6,
    name: 'Microscópio Óptico',
    category: 'equipment',
    stock: 5,
    unit: 'Unidades',
    location: 'Sala E2',
    expiryDate: null,
    lastUsed: '2023-04-05',
    status: 'ok'
  },
  {
    id: 7,
    name: 'Pipeta Graduada',
    category: 'glassware',
    stock: 25,
    unit: 'Unidades',
    location: 'Armário G2',
    size: '10ml',
    expiryDate: null,
    lastUsed: '2023-04-14',
    status: 'ok'
  },
  {
    id: 8,
    name: 'Tubos de Ensaio',
    category: 'glassware',
    stock: 8,
    unit: 'Unidades',
    location: 'Armário G3',
    size: '15ml',
    expiryDate: null,
    lastUsed: '2023-04-16',
    status: 'low'
  },
];

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredItems, setFilteredItems] = useState(inventoryItems);
  const containerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    // Filtering logic
    let filtered = inventoryItems;
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);

    // Animation when filter changes
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.inventory-item',
        { opacity: 0, x: 10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    // Initial animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.inventory-filters',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }
      );
      
      gsap.fromTo(
        '.item-list',
        { opacity: 0, x: 20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1,
          stagger: 0.05,
          delay: 0.2,
          ease: 'power2.out'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleConsumeItem = (itemId) => {
    toast({
      title: "Item consumido",
      description: "O consumo foi registrado com sucesso.",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'ok':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Mock data for stock details
  const getStockDetails = (itemId) => {
    // This would normally come from an API
    return {
      available: 15,
      reserved: 3,
      usedThisMonth: 8,
      lastReplenishment: '2024-05-01',
      batchExpiry: '2025-12-30'
    };
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventário</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os itens de laboratório</p>
      </div>

      {/* Filters - Improved for mobile */}
      <Card className="inventory-filters ">
        <CardContent className="p-4 dark:border-none rounded-md bg-neutral-100/80 dark:bg-neutral-800/80 ">
          <div className="flex flex-col gap-4 ">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 transform text-gray-400 " size={18} />
              <Input
                placeholder="Buscar item..."
                className="pl-10 w-full dark:border-none rounded-md bg-white dark:bg-neutral-700/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              {/* Category filter - scrollable on mobile */}
              <div className="overflow-x-auto pb-1 -mx-1">
                <div className="flex space-x-1 px-1 min-w-max">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-3 py-2 text-sm font-medium whitespace-nowrap dark:border-none ${
                        selectedCategory === category.id
                          ? 'bg-lab-blue text-white dark:bg-lab-blue/80'
                          : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-neutral-700/80 dark:text-gray-300 dark:hover:bg-gray-700' 
                      } rounded-md border border-gray-200 dark:border-gray-700 transition-colors`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button className="flex items-center gap-2 whitespace-nowrap bg-neutral-950/90 dark:bg-gray-100/90">
                <Plus size={16} />
                <span className="hidden sm:inline">Novo Item</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 item-list">
        {filteredItems.map((item) => {
          const stockDetails = getStockDetails(item.id);
          
          return (
            <Card key={item.id} className="inventory-item overflow-hidden h-full bg-white dark:bg-neutral-900/50">
              <div 
                className={`h-1 ${
                  item.status === 'low' ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="mr-2">
                    <h3 className="font-medium text-lg line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {categories.find(c => c.id === item.category)?.name}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)} whitespace-nowrap`}>
                    {item.stock} {item.unit}
                  </span>
                </div>
                
                <div className="mt-2 text-sm space-y-2 flex-grow">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Localização:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">{item.location}</span>
                  </div>
                  
                  {item.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Validade:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">
                        {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Último uso:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">
                      {new Date(item.lastUsed).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {item.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Tamanho:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">
                        {item.size}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        className="w-full bg-neutral-200 hover:bg-blue-400 dark:bg-neutral-950/60 dark:hover:bg-blue-300 dark:hover:text-gray-800 text-gray-700 dark:text-white transition-colors"
                      >
                        Ver Estoque
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 sm:w-80">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-base mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Detalhes do estoque</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Disponíveis:</span>
                          </div>
                          <span className="font-medium">{stockDetails.available} {item.unit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Reservadas:</span>
                          </div>
                          <span className="font-medium">{stockDetails.reserved} {item.unit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Utilizadas neste mês:</span>
                          </div>
                          <span className="font-medium">{stockDetails.usedThisMonth} {item.unit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Última reposição:</span>
                          </div>
                          <span className="font-medium">
                            {new Date(stockDetails.lastReplenishment).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Validade do lote:</span>
                          </div>
                          <span className="font-medium">
                            {new Date(stockDetails.batchExpiry).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Nenhum item encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
