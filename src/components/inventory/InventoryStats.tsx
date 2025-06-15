
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';

interface InventoryStatsProps {
  items: InventoryItem[];
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ items }) => {
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.current_stock <= item.min_stock).length;
  const criticalItems = items.filter(item => item.current_stock === 0).length;
  const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.cost_per_unit || 0)), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const stats = [
    {
      title: "Total de Itens",
      value: totalItems.toString(),
      description: "Itens no inventário",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Estoque Baixo",
      value: lowStockItems.toString(),
      description: "Itens abaixo do mínimo",
      icon: TrendingDown,
      color: "text-yellow-600"
    },
    {
      title: "Estoque Crítico",
      value: criticalItems.toString(),
      description: "Itens sem estoque",
      icon: AlertCircle,
      color: "text-red-600"
    },
    {
      title: "Valor Total",
      value: formatCurrency(totalValue),
      description: "Valor do inventário",
      icon: DollarSign,
      color: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InventoryStats;
