
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardData";

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
            <CardContent className="pt-4 sm:pt-5 p-3 md:p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total de Itens",
      value: stats?.totalItems || 0,
      trend: "up",
      trendValue: "+2.5%",
      description: "este mês"
    },
    {
      title: "Consumo Mensal",
      value: stats?.monthlyConsumption || 0,
      trend: "down",
      trendValue: "-1.8%",
      description: "este mês"
    },
    {
      title: "Itens Expirando",
      value: stats?.expiringItems || 0,
      trend: "warning",
      trendValue: "Próximos 30 dias",
      description: ""
    },
    {
      title: "Em Alerta",
      value: stats?.lowStockItems || 0,
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
          <CardContent className="pt-4 sm:pt-5 p-3 md:p-4">
            <div className="flex items-center justify-between p-2">
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
