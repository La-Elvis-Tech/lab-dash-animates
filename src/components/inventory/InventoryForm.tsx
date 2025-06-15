
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InventoryFormProps {
  onSuccess: () => void;
  categories: any[];
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    unit_measure: '',
    cost_per_unit: 0,
    supplier: '',
    storage_location: '',
    sku: '',
    expiry_date: '',
    lot_number: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the first unit ID for now (should be selected by user in a real app)
      const { data: units } = await supabase
        .from('units')
        .select('id')
        .eq('active', true)
        .limit(1);

      if (!units || units.length === 0) {
        throw new Error('Nenhuma unidade encontrada');
      }

      const itemData = {
        ...formData,
        unit_id: units[0].id,
        expiry_date: formData.expiry_date || null,
        lot_number: formData.lot_number || null,
        active: true
      };

      const { error } = await supabase
        .from('inventory_items')
        .insert([itemData]);

      if (error) throw error;

      toast({
        title: "Item adicionado",
        description: "O item foi adicionado ao inventário com sucesso."
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o item.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nome do item"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Categoria *</Label>
          <Select 
            value={formData.category_id} 
            onValueChange={(value) => handleInputChange('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder="Código do produto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleInputChange('supplier', e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_stock">Estoque Atual *</Label>
          <Input
            id="current_stock"
            type="number"
            min="0"
            value={formData.current_stock}
            onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock">Estoque Mínimo *</Label>
          <Input
            id="min_stock"
            type="number"
            min="0"
            value={formData.min_stock}
            onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_stock">Estoque Máximo</Label>
          <Input
            id="max_stock"
            type="number"
            min="0"
            value={formData.max_stock}
            onChange={(e) => handleInputChange('max_stock', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_measure">Unidade de Medida *</Label>
          <Input
            id="unit_measure"
            value={formData.unit_measure}
            onChange={(e) => handleInputChange('unit_measure', e.target.value)}
            placeholder="Ex: ml, unidade, kg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_per_unit">Custo por Unidade</Label>
          <Input
            id="cost_per_unit"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_per_unit}
            onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storage_location">Localização</Label>
          <Input
            id="storage_location"
            value={formData.storage_location}
            onChange={(e) => handleInputChange('storage_location', e.target.value)}
            placeholder="Ex: Geladeira A1, Armário B2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry_date">Data de Validade</Label>
          <Input
            id="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={(e) => handleInputChange('expiry_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lot_number">Número do Lote</Label>
          <Input
            id="lot_number"
            value={formData.lot_number}
            onChange={(e) => handleInputChange('lot_number', e.target.value)}
            placeholder="Ex: LOT2024001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrição detalhada do item"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar Item"}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
