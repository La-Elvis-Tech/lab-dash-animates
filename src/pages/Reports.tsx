import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, format, startOfDay } from "date-fns";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

// Import new advanced components
import AdvancedFilters from "@/components/reports/AdvancedFilters";
import PerformanceMetrics from "@/components/reports/PerformanceMetrics";
import CostAnalysis from "@/components/reports/CostAnalysis";
import ExportControls from "@/components/reports/ExportControls";

import DashboardChart, { CHART_COLORS } from "@/components/DashboardChart.js";

// Mock data for appointments (same as in Orders.tsx)

const COLORS = [
  "#8B5CF6",
  "#D946EF",
  "#F97316",
  "#0EA5E9",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#F59E0B",
];

const mockAppointments = [
  {
    id: "A001",
    patient: "João Silva",
    type: "Coleta de Sangue",
    date: new Date(2024, 4, 15, 9, 30),
    doctor: "Dra. Ana Souza",
    unit: "Unidade Centro",
    cost: 120.0,
    status: "Concluído",
  },
  {
    id: "A002",
    patient: "Maria Santos",
    type: "Entrega de Resultado",
    date: new Date(2024, 4, 16, 10, 45),
    doctor: "Dr. Carlos Mendes",
    unit: "Unidade Norte",
    cost: 0,
    status: "Cancelado",
  },
  {
    id: "A003",
    patient: "Pedro Oliveira",
    type: "Colonoscopia",
    date: new Date(2024, 4, 22, 8, 0),
    doctor: "Dra. Lucia Freitas",
    unit: "Unidade Sul",
    cost: 550.0,
    status: "Confirmado",
  },
  {
    id: "A004",
    patient: "Ana Pereira",
    type: "Ultrassom",
    date: new Date(2024, 4, 23, 14, 15),
    doctor: "Dr. Roberto Castro",
    unit: "Unidade Leste",
    cost: 280.0,
    status: "Confirmado",
  },
  {
    id: "A005",
    patient: "Carlos Ribeiro",
    type: "Raio-X",
    date: new Date(2024, 4, 24, 11, 0),
    doctor: "Dra. Fernanda Lima",
    unit: "Unidade Centro",
    cost: 180.0,
    status: "Confirmado",
  },
  {
    id: "A006",
    patient: "Luiza Martins",
    type: "Eletrocardiograma",
    date: new Date(2024, 4, 25, 15, 30),
    doctor: "Dr. Paulo Vieira",
    unit: "Unidade Norte",
    cost: 220.0,
    status: "Agendado",
  },
  {
    id: "A007",
    patient: "Paulo Costa",
    type: "Coleta de Sangue",
    date: new Date(2024, 4, 19, 9, 0),
    doctor: "Dra. Ana Souza",
    unit: "Unidade Sul",
    cost: 120.0,
    status: "Agendado",
  },
  {
    id: "A008",
    patient: "Mariana Lima",
    type: "Densitometria",
    date: new Date(2024, 4, 20, 13, 45),
    doctor: "Dr. José Santos",
    unit: "Unidade Leste",
    cost: 320.0,
    status: "Agendado",
  },
  {
    id: "A009",
    patient: "Ricardo Alves",
    type: "Tomografia",
    date: new Date(2024, 4, 28, 10, 30),
    doctor: "Dra. Carla Mendes",
    unit: "Unidade Centro",
    cost: 850.0,
    status: "Agendado",
  },
  {
    id: "A010",
    patient: "Camila Ferreira",
    type: "Mamografia",
    date: new Date(2024, 4, 30, 11, 15),
    doctor: "Dr. André Oliveira",
    unit: "Unidade Norte",
    cost: 380.0,
    status: "Agendado",
  },
];

const Reports = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({});
  const today = startOfDay(new Date());

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  // Calculate weekly expenses
  const calculateWeeklyExpenses = () => {
    const weeklyData = Array(7)
      .fill(0)
      .map((_, i) => {
        const date = addDays(today, i);
        const dayAppointments = mockAppointments.filter(
          (app) =>
            date.getDate() === new Date(app.date).getDate() &&
            date.getMonth() === new Date(app.date).getMonth()
        );
        const total = dayAppointments.reduce((sum, app) => sum + app.cost, 0);
        return {
          name: format(date, "dd/MM"),
          value: total,
        };
      });

    return weeklyData;
  };

  // Calculate monthly expenses by unit
  const calculateMonthlyExpensesByUnit = () => {
    const unitExpenses = mockAppointments.reduce((acc, app) => {
      const unit = app.unit;
      if (!acc[unit]) {
        acc[unit] = 0;
      }
      acc[unit] += app.cost;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(unitExpenses).map((unit) => ({
      name: unit.replace("Unidade ", ""),
      value: unitExpenses[unit],
    }));
  };

  // Calculate expenses by type of exam
  const calculateExpensesByExamType = () => {
    const typeExpenses = mockAppointments.reduce((acc, app) => {
      const type = app.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += app.cost;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(typeExpenses).map((type) => ({
      name: type,
      value: typeExpenses[type],
    }));
  };

  // Weekly expenses data for chart
  const weeklyExpenses = calculateWeeklyExpenses();
  const monthlyExpensesByUnit = calculateMonthlyExpensesByUnit();
  const expensesByExamType = calculateExpensesByExamType();

  // Calculate total expenses
  const totalWeeklyExpenses = weeklyExpenses.reduce(
    (sum, day) => sum + day.value,
    0
  );
  const totalMonthlyExpenses = monthlyExpensesByUnit.reduce(
    (sum, unit) => sum + unit.value,
    0
  );

  const handleExport = (format: string, dataTypes: string[]) => {
    console.log(`Exporting ${dataTypes.join(', ')} in ${format} format`);
    // Implementation for actual export would go here
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to data
  };

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="rounded-lg mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Relatórios Avançados
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Análise detalhada com métricas de performance e previsões
        </p>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters onFiltersChange={handleFiltersChange} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mx-1 xl:-mx-3 px-1 sm:px-2">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="cost-analysis" className="text-xs sm:text-sm">
              Análise de Custos
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm">
              Exportação
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            {/* Original expense analysis - keeping existing functionality */}
            <Card className="dark:bg-gray-800/50 dark:text-gray-100 overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Análise de Despesas
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Visualização detalhada das despesas por período e tipo de exame
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="overflow-x-auto mx-1 xl:-mx-3 px-1 sm:px-2">
                    <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto">
                      <TabsTrigger value="weekly" className="text-xs sm:text-sm ">
                        Semana
                      </TabsTrigger>
                      <TabsTrigger value="monthly" className="text-xs sm:text-sm ">
                        Mês por Unidade
                      </TabsTrigger>
                      <TabsTrigger value="byType" className="text-xs sm:text-sm">
                        Tipo de Exame
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="weekly" className="mt-0">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="w-full overflow-hidden">
                        <DashboardChart
                          type="bar"
                          data={weeklyExpenses}
                          title="Despesas Semanais"
                          description="Gastos previstos para os próximos 7 dias"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 ">
                        <div className="p-3 sm:p-4 rounded-lg bg-white dark:bg-neutral-900/50">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Total de despesas previstas
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            R$ {totalWeeklyExpenses.toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 rounded-lg bg-white dark:bg-neutral-900/50">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Média diária
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            R$ {(totalWeeklyExpenses / 7).toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 rounded-lg bg-white dark:bg-neutral-900/50">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            N° de agendamentos
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {mockAppointments.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="monthly" className="mt-0">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="w-full overflow-hidden">
                        <DashboardChart
                          type="bar"
                          data={monthlyExpensesByUnit}
                          title="Despesas por Unidade"
                          description="Gastos mensais distribuídos por unidade"
                        />
                      </div>

                      <div className="p-3 sm:p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Total de despesas mensais
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          R$ {totalMonthlyExpenses.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="byType" className="mt-0">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="w-full overflow-hidden">
                        <DashboardChart
                          type="progress"
                          data={expensesByExamType}
                          title="Despesas por Tipo de Exame"
                          description="Distribuição de gastos por categoria de exame"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Original financial summary - keeping existing functionality */}
            <Card className="dark:bg-gray-800/50 dark:text-gray-100">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Resumo Financeiro
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Visão geral das despesas recentes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-4 mt-2">
                  <ScrollArea className="h-[400px] sm:h-[500px] overflow-auto">
                    <div className="space-y-4">
                      <h4 className="font-medium text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        PRÓXIMOS AGENDAMENTOS
                      </h4>
                      <div className="space-y-3">
                        {mockAppointments
                          .filter((app) => new Date(app.date) >= today)
                          .sort(
                            (a, b) =>
                              new Date(a.date).getTime() -
                              new Date(b.date).getTime()
                          )
                          .slice(0, 5)
                          .map((app) => (
                            <div
                              key={app.id}
                              className="border-l-4 pl-2 sm:pl-3 py-2 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800 dark:to-gray-900/80 rounded-r-md"
                              style={{
                                borderImageSource:
                                  "linear-gradient(to bottom, #8B5CF6, #6366F1)",
                                borderImageSlice: 1,
                              }}
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="font-medium text-sm sm:text-base">
                                  {app.patient}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1 sm:mt-0">
                                  R$ {app.cost.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>
                                  {format(app.date, "dd/MM/yyyy")} · {app.type}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border-0 px-2 py-1"
                                >
                                  {app.unit}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>

                      <h4 className="font-medium text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-6 mb-2">
                        DESPESAS POR TIPO
                      </h4>
                      <div className="space-y-2">
                        {expensesByExamType
                          .sort((a, b) => b.value - a.value)
                          .map((type, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[index % CHART_COLORS.length],
                                  }}
                                />
                                <span className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[160px]">
                                  {type.name}
                                </span>
                              </div>
                              <span className="font-medium text-xs sm:text-sm">
                                R$ {type.value.toFixed(2)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Original trends chart - keeping existing functionality */}
            <Card className="dark:bg-gray-800/50 dark:text-gray-100">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Tendências de Despesas
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Análise de tendências de gastos ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="w-full overflow-hidden">
                  <DashboardChart
                    type="line"
                    data={weeklyExpenses}
                    title="Tendências Semanais"
                    description="Variação das despesas ao longo das últimas semanas"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="cost-analysis" className="mt-0">
          <CostAnalysis />
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <ExportControls onExport={handleExport} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
