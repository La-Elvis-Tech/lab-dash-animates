
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: "Total de Itens",
      value: "1,284",
      trend: "up",
      trendValue: "+2.5%",
      description: "este mês"
    },
    {
      title: "Consumo Mensal",
      value: "187",
      trend: "down",
      trendValue: "-1.8%",
      description: "este mês"
    },
    {
      title: "Reagentes",
      value: "362",
      trend: "up",
      trendValue: "+5.2%",
      description: "este mês"
    },
    {
      title: "Em Alerta",
      value: "12",
      trend: "warning",
      trendValue: "Requer atenção",
      description: ""
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp size={12} className="mr-1" />;
      case "down": return <TrendingDown size={12} className="mr-1" />;
      case "warning": return <AlertCircle size={12} className="mr-1" />;
      default: return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600 dark:text-green-400";
      case "down": return "text-red-600 dark:text-red-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
          <CardContent className="pt-4 sm:pt-5 p-3 md:p-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <p className="text-md sm:text-md font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-700 dark:text-white">
                  {stat.value}
                </h3>
                <p className={`text-sm flex items-center mt-1 ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  {stat.trendValue} {stat.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
