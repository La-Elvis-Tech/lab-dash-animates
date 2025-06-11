import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardChart from "@/components/DashboardChart";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CostAnalysis: React.FC = () => {
  const costPerExam = [
    { name: "Coleta de Sangue", value: 45.5 },
    { name: "Ultrassom", value: 125.3 },
    { name: "Raio-X", value: 78.9 },
    { name: "Tomografia", value: 245.6 },
    { name: "Mamografia", value: 156.8 },
  ];

  const paretoData = [
    { name: "Reagente X", value: 45, percentage: 45 },
    { name: "Equipamento Y", value: 25, percentage: 70 },
    { name: "Descartável Z", value: 15, percentage: 85 },
    { name: "Vidraria A", value: 10, percentage: 95 },
    { name: "Outros", value: 5, percentage: 100 },
  ];

  const radarData = [
    { name: "Sede Minas Gerais", gastosK: 722 },
    { name: "Sede Goiás", gastosK: 295 },
    { name: "Sede Bahia", gastosK: 911 },
    { name: "Sede Ceará", gastosK: 396 },
    { name: "Sede São Paulo", gastosK: 1059 },
    { name: "Sede Paraná", gastosK: 762 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
            Custo Médio por Exame
          </CardTitle>
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
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Análise de Pareto - Itens mais Caros
            </CardTitle>
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

        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
              Radar de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" minHeight={100} height={500} maxHeight={500}>
              <RadarChart
                cx="50%" cy="50%" outerRadius={140} data={radarData}
              >
                <PolarGrid />
                <PolarAngleAxis 
                dataKey="name"
                tick={{ fontSize: 14, fill: '#a2a6ad', fontWeight: 500, }}
                tickFormatter={(value) => {
                  const parts = value.split(" ");
                  // Exibe o segundo e terceiro termo se existirem, senão exibe o que houver
                  if (parts.length >= 3) {
                    return parts[1] + " " + parts[2];
                  } else if (parts.length === 2) {
                    return parts[1];
                  }
                  return parts[0];
                }} // Exibe apenas os termos disponíveis, sem undefined
                />
                <PolarRadiusAxis 
                tick={{ fontSize: 12, fill: '#a2a6ad', fontWeight: 500, }}
                />
                <Radar
                  name="Gastos (em milhares)"
                  dataKey="gastosK"
                  stroke="#4e63bd"
                  fill="#322d9e"
                  fillOpacity={0.7}
                />
                <Legend
                  iconSize={10}
                  iconType="circle"
                  layout="vertical"
                  verticalAlign="bottom"
                  align="left"
                  wrapperStyle={{ paddingRight: 20, fontSize: 14, fontWeight: 500 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalysis;
