
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface ConsumptionData {
  name: string;
  value: number;
}

export interface AppointmentTrend {
  month: string;
  appointments: number;
  revenue: number;
}

export interface InventoryPercentItem {
  name: string;
  value: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Buscar dados do inventário
      const { data: items } = await supabase
        .from('inventory_items')
        .select('current_stock, min_stock, expiry_date')
        .eq('active', true);

      // Buscar dados dos agendamentos
      const { data: appointments } = await supabase
        .from('appointments')
        .select('status, cost, scheduled_date, created_at');

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

      const totalAppointments = appointments?.length || 0;
      const pendingAppointments = appointments?.filter(app => 
        app.status === 'Agendado' || app.status === 'Confirmado'
      ).length || 0;
      const completedAppointments = appointments?.filter(app => 
        app.status === 'Concluído'
      ).length || 0;

      const totalRevenue = appointments?.filter(app => 
        app.status === 'Concluído' && app.cost
      ).reduce((sum, app) => sum + (app.cost || 0), 0) || 0;

      // Receita do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = appointments?.filter(app => {
        if (app.status !== 'Concluído' || !app.cost) return false;
        const appointmentDate = new Date(app.scheduled_date);
        return appointmentDate.getMonth() === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      }).reduce((sum, app) => sum + (app.cost || 0), 0) || 0;

      return {
        totalItems,
        lowStockItems,
        expiringItems,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue,
        monthlyRevenue
      };
    }
  });
};

export const useConsumptionData = () => {
  return useQuery({
    queryKey: ['consumption-data'],
    queryFn: async (): Promise<ConsumptionData[]> => {
      const { data: movements } = await supabase
        .from('inventory_movements')
        .select('created_at, quantity, movement_type')
        .eq('movement_type', 'saida')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!movements) return [];

      const monthlyData: { [key: string]: number } = {};
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      movements.forEach(movement => {
        const date = new Date(movement.created_at);
        const monthKey = months[date.getMonth()];
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + movement.quantity;
      });

      return months.map(month => ({
        name: month,
        value: monthlyData[month] || 0
      })).slice(-7);
    }
  });
};

export const useAppointmentTrends = () => {
  return useQuery({
    queryKey: ['appointment-trends'],
    queryFn: async (): Promise<AppointmentTrend[]> => {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_date, cost, status')
        .gte('scheduled_date', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!appointments) return [];

      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData: { [key: string]: { appointments: number; revenue: number } } = {};

      appointments.forEach(appointment => {
        const date = new Date(appointment.scheduled_date);
        const monthKey = months[date.getMonth()];
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { appointments: 0, revenue: 0 };
        }
        
        monthlyData[monthKey].appointments += 1;
        if (appointment.status === 'Concluído' && appointment.cost) {
          monthlyData[monthKey].revenue += appointment.cost;
        }
      });

      return months.map(month => ({
        month,
        appointments: monthlyData[month]?.appointments || 0,
        revenue: monthlyData[month]?.revenue || 0
      })).slice(-6);
    }
  });
};

export const useInventoryPercent = () => {
  return useQuery({
    queryKey: ['inventory-percent'],
    queryFn: async (): Promise<InventoryPercentItem[]> => {
      const { data: categories } = await supabase
        .from('inventory_categories')
        .select('id, name');

      const { data: items } = await supabase
        .from('inventory_items')
        .select('category_id, current_stock')
        .eq('active', true);

      if (!categories || !items) return [];

      const categoryTotals = categories.map(category => {
        const categoryItems = items.filter(item => item.category_id === category.id);
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
