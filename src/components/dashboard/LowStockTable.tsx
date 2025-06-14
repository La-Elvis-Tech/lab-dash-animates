
import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DepletionItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

const LowStockTable: React.FC = () => {
  const { data: itemsNearDepletion, isLoading } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async (): Promise<DepletionItem[]> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, current_stock, min_stock, unit_measure')
        .eq('active', true)
        .order('current_stock', { ascending: true })
        .limit(4);

      if (error) throw error;

      // Filter items where current stock is below minimum stock
      const lowStockItems = data?.filter(item => 
        item.current_stock <= item.min_stock
      ) || [];

      return lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        unit: item.unit_measure
      }));
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="p-2 text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
            Itens em Baixo Estoque
          </h2>
          <Link
            to="/inventory"
            className="text-xs sm:text-sm px-3 text-lab-blue dark:text-blue-300 hover:underline"
          >
            Ver Todos
          </Link>
        </div>
        <div className="p-2 overflow-x-auto">
          <div className="p-0 lg:px-6 min-w-[500px] md:min-w-0">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-base">
              <thead>
                <tr className="text-gray-700 dark:text-gray-100">
                  <th
                    scope="col"
                    className="px-2 py-3 font-semibold text-left"
                  >
                    Nome do Item
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 font-semibold text-right"
                  >
                    Estoque Atual
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 font-semibold text-right"
                  >
                    Estoque Mínimo
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 font-semibold text-right"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {itemsNearDepletion?.map((item) => (
                  <tr key={item.id}>
                    <td className="text-sm px-2 py-3 font-medium dark:text-gray-300 text-gray-800 text-left">
                      {item.name}
                    </td>
                    <td className="text-sm px-2 py-3 dark:text-gray-300 text-gray-800 text-right">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="text-sm px-2 py-3 dark:text-gray-300 text-gray-800 text-right">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                        Crítico
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LowStockTable;
