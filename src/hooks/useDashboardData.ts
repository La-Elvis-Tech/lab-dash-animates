
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  monthlyConsumption: number;
}

export interface ConsumptionData {
  name: string;
  value: number;
}

export interface InventoryPercentItem {
  name: string;
  value: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: items } = await supabase
        .from('inventory_items')
        .select('current_stock, min_stock, expiry_date')
        .eq('active', true);

      const totalItems = items?.length || 0;
      const lowStockItems = items?.filter(item => 
        item.current_stock <= item.min_stock
      ).length || 0;
      
      const expiringItems = items?.filter(item => {
        if (!item.expiry_date) return false;
        const expiryDate = new Date(item.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length || 0;

      // Simulação do consumo mensal - em produção seria calculado de movimentações
      const monthlyConsumption = 340;

      return {
        totalItems,
        lowStockItems,
        expiringItems,
        monthlyConsumption
      };
    }
  });
};

export const useConsumptionData = () => {
  return useQuery({
    queryKey: ['consumption-data'],
    queryFn: async (): Promise<ConsumptionData[]> => {
      // Em produção, isso viria de dados reais de consumo
      // Por enquanto, retornando dados simulados baseados em movimentações
      return [
        { name: "Jan", value: 23 },
        { name: "Fev", value: 34 },
        { name: "Mar", value: 45 },
        { name: "Abr", value: 31 },
        { name: "Mai", value: 42 },
        { name: "Jun", value: 52 },
        { name: "Jul", value: 49 },
      ];
    }
  });
};

export const useInventoryPercent = () => {
  return useQuery({
    queryKey: ['inventory-percent'],
    queryFn: async (): Promise<InventoryPercentItem[]> => {
      const { data: categories } = await supabase
        .from('inventory_categories')
        .select('name');

      const { data: items } = await supabase
        .from('inventory_items')
        .select('category_id, current_stock')
        .eq('active', true);

      if (!categories || !items) return [];

      const categoryTotals = categories.map(category => {
        const categoryItems = items.filter(item => item.category_id === category.name);
        const totalStock = categoryItems.reduce((sum, item) => sum + item.current_stock, 0);
        return {
          name: category.name,
          value: totalStock
        };
      });

      const totalStock = categoryTotals.reduce((sum, cat) => sum + cat.value, 0);
      
      return categoryTotals.map(cat => ({
        name: cat.name,
        value: totalStock > 0 ? Math.round((cat.value / totalStock) * 100) : 0
      }));
    }
  });
};
