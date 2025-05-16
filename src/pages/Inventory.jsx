
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    expiryDate: '2025-12-30',
    lastUsed: '2023-04-12',
    status: 'low'
  },
  {
    id: 4,
    name: 'Balão Volumétrico 500ml',
    category: 'glassware',
    stock: 12,
    unit: 'Unidades',
    location: 'Armário G4',
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
    name: 'Pipeta Graduada 10ml',
    category: 'glassware',
    stock: 25,
    unit: 'Unidades',
    location: 'Armário G2',
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
    // Filtragem (mesma lógica)
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
        return 'bg-red-100 text-red-800';
      case 'ok':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Inventário</h1>
        <p className="text-gray-500 mt-1">Gerencie os itens de laboratório</p>
      </div>

      {/* Filters */}
      <Card className="inventory-filters">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar item..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="z-10 relative">
                <div className="flex">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-4 py-2 text-sm font-medium ${
                        selectedCategory === category.id
                          ? 'bg-lab-blue text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } border border-gray-200 first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0 transition-colors`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Novo Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 item-list">
        {filteredItems.map((item) => (
          <Card key={item.id} className="inventory-item overflow-hidden">
            <div 
              className={`h-1 ${
                item.status === 'low' ? 'bg-red-500' : 'bg-green-500'
              }`}
            />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {categories.find(c => c.id === item.category)?.name}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                  {item.stock} {item.unit}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Localização:</span>
                  <span className="font-medium">{item.location}</span>
                </div>
                
                {item.expiryDate && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Validade:</span>
                    <span className="font-medium">
                      {new Date(item.expiryDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Último uso:</span>
                  <span className="font-medium">
                    {new Date(item.lastUsed).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <div className="mt-5 flex">
                <Button 
                  className="flex-1 bg-lab-blue hover:bg-blue-700 text-white"
                  onClick={() => handleConsumeItem(item.id)}
                >
                  Registrar Consumo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum item encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
