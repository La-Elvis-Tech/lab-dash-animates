
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardChart from "@/components/DashboardChart";

const CostAnalysis: React.FC = () => {
  const costPerExam = [
    { name: "Coleta de Sangue", value: 45.50 },
    { name: "Ultrassom", value: 125.30 },
    { name: "Raio-X", value: 78.90 },
    { name: "Tomografia", value: 245.60 },
    { name: "Mamografia", value: 156.80 }
  ];

  const paretoData = [
    { name: "Reagente X", value: 45, percentage: 45 },
    { name: "Equipamento Y", value: 25, percentage: 70 },
    { name: "Descartável Z", value: 15, percentage: 85 },
    { name: "Vidraria A", value: 10, percentage: 95 },
    { name: "Outros", value: 5, percentage: 100 }
  ];

  const heatmapData = [
    { month: "Jan", reagentes: 120, vidraria: 80, equipamentos: 200, descartaveis: 60 },
    { month: "Fev", reagentes: 140, vidraria: 90, equipamentos: 180, descartaveis: 70 },
    { month: "Mar", reagentes: 160, vidraria: 85, equipamentos: 220, descartaveis: 75 },
    { month: "Abr", reagentes: 130, vidraria: 95, equipamentos: 190, descartaveis: 65 },
    { month: "Mai", reagentes: 180, vidraria: 100, equipamentos: 240, descartaveis: 80 },
    { month: "Jun", reagentes: 150, vidraria: 110, equipamentos: 210, descartaveis: 85 }
  ];

  return (
    <div className="space-y-6">
      {/* Cost per Exam */}
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 dark:text-white">Custo Médio por Exame</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardChart
            type="bar"
            data={costPerExam}
            title="Custo por Tipo de Exame"
            description="Média de gastos em insumos por exame realizado"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Analysis */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 dark:text-white">Análise de Pareto - Itens mais Caros</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart
              type="progress"
              data={paretoData}
              title="80/20 dos Gastos"
              description="20% dos itens representam 80% dos custos"
            />
          </CardContent>
        </Card>

        {/* Cost Heatmap */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 dark:text-white">Heatmap de Consumo</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart
              type="area"
              data={heatmapData}
              title="Intensidade de Gastos"
              description="Consumo por categoria ao longo do tempo"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalysis;
