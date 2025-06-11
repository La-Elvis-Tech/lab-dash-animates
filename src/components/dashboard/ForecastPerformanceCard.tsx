
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Target } from "lucide-react";

const ForecastPerformanceCard: React.FC = () => {
  const mapeScore = 12.3; // Mean Absolute Percentage Error
  
  const performanceData = [
    { month: "Jan", real: 180, predicted: 175 },
    { month: "Fev", real: 195, predicted: 190 },
    { month: "Mar", real: 220, predicted: 205 },
    { month: "Abr", real: 185, predicted: 195 },
    { month: "Mai", real: 210, predicted: 215 },
    { month: "Jun", real: 235, predicted: 225 }
  ];

  const getPerformanceLevel = (mape: number) => {
    if (mape <= 10) return { level: "Excelente", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (mape <= 20) return { level: "Bom", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (mape <= 30) return { level: "Regular", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { level: "Ruim", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  const performance = getPerformanceLevel(mapeScore);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
          Performance de Previsão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-300/40 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-neutral-900">
            <div>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {mapeScore}%
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erro médio (MAPE)
              </p>
            </div>
            <Badge className={performance.color}>
              {performance.level}
            </Badge>
          </div>

          <div className="h-24 px-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(31 41 55)',
                    borderColor: 'rgb(55 65 81)',
                    borderRadius: '0.5rem',
                    color: 'rgb(243 244 246)',
                    fontSize: '11px',
                    padding: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="real" 
                  stroke="#4F46E5" 
                  strokeWidth={2} 
                  dot={false} 
                  name="Real"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#A5B4FC" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false} 
                  name="Previsto"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 px-3">
            Real vs Previsto (últimos 6 meses)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastPerformanceCard;
