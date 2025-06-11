
import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface DepletionItem {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

const LowStockTable: React.FC = () => {
  const itemsNearDepletion: DepletionItem[] = [
    {
      id: 1,
      name: "Etanol Absoluto",
      currentStock: 3,
      minStock: 5,
      unit: "Litros",
    },
    {
      id: 2,
      name: "Luvas de Nitrila",
      currentStock: 10,
      minStock: 50,
      unit: "Pares",
    },
    {
      id: 3,
      name: "Placas de Petri",
      currentStock: 15,
      minStock: 25,
      unit: "Unidades",
    },
    {
      id: 4,
      name: "Tubos de Ensaio",
      currentStock: 8,
      minStock: 20,
      unit: "Unidades",
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950/90">
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
                {itemsNearDepletion.map((item) => (
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
