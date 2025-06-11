
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import DashboardChart from "@/components/DashboardChart";

const PerformanceMetrics: React.FC = () => {
  const forecastAccuracy = {
    mape: 12.3,
    rmse: 8.7,
    trend: "improving"
  };

  const realVsPredicted = [
    { name: "Jan", real: 180, predicted: 175 },
    { name: "Fev", real: 195, predicted: 190 },
    { name: "Mar", real: 220, predicted: 205 },
    { name: "Abr", real: 185, predicted: 195 },
    { name: "Mai", real: 210, predicted: 215 },
    { name: "Jun", real: 235, predicted: 225 }
  ];

  const anomalies = [
    { item: "Reagente X", deviation: "+45%", date: "15/05", type: "high" },
    { item: "Luvas Nitrila", deviation: "-30%", date: "22/05", type: "low" },
    { item: "Etanol", deviation: "+60%", date: "28/05", type: "critical" }
  ];

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Forecast Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Precisão das Previsões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">MAPE</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{forecastAccuracy.mape}%</span>
                <TrendingDown size={16} className="text-green-500" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">RMSE</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{forecastAccuracy.rmse}</span>
                <TrendingUp size={16} className="text-red-500" />
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center">
              Modelo em melhoria contínua
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Real vs Predicted Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Real vs Previsto</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardChart
            type="line"
            data={realVsPredicted}
            title="Comparação Mensal"
            description="Consumo real vs previsto"
          />
        </CardContent>
      </Card>

      {/* Anomalies Detection */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            Anomalias Detectadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="font-medium">{anomaly.item}</span>
                  <span className="text-sm text-gray-500 ml-2">em {anomaly.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{anomaly.deviation}</span>
                  <Badge className={getAnomalyColor(anomaly.type)}>
                    {anomaly.type === "critical" ? "Crítico" : anomaly.type === "high" ? "Alto" : "Baixo"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
