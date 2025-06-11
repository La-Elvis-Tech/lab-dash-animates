
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
import { TrendingUp, Calendar, DollarSign, FileText } from "lucide-react";

import DashboardChart, { CHART_COLORS } from "@/components/DashboardChart.js";

// Import simplified advanced components
import AdvancedFilters from "@/components/reports/AdvancedFilters";
import PerformanceMetrics from "@/components/reports/PerformanceMetrics";
import CostAnalysis from "@/components/reports/CostAnalysis";
import ExportControls from "@/components/reports/ExportControls";

// Simplified mock data
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
    cost: 80.0,
    status: "Concluído",
  },
  {
    id: "A003",
    patient: "Pedro Oliveira",
    type: "Colonoscopia",
    date: new Date(2024, 4, 22, 8, 0),
    doctor: "Dra. Lucia Freitas",
    unit: "Unidade Sul",
    cost: 550.0,
    status: "Agendado",
  },
  {
    id: "A004",
    patient: "Ana Pereira",
    type: "Ultrassom",
    date: new Date(2024, 4, 23, 14, 15),
    doctor: "Dr. Roberto Castro",
    unit: "Unidade Leste",
    cost: 280.0,
    status: "Agendado",
  },
];

const Reports = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("weekly");
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

  // Calculate analytics data
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

  const calculateExpensesByUnit = () => {
    const unitExpenses = mockAppointments.reduce((acc, app) => {
      const unit = app.unit.replace("Unidade ", "");
      if (!acc[unit]) {
        acc[unit] = 0;
      }
      acc[unit] += app.cost;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(unitExpenses).map((unit) => ({
      name: unit,
      value: unitExpenses[unit],
    }));
  };

  const calculateExpensesByType = () => {
    const typeExpenses = mockAppointments.reduce((acc, app) => {
      if (!acc[app.type]) {
        acc[app.type] = 0;
      }
      acc[app.type] += app.cost;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(typeExpenses).map((type) => ({
      name: type,
      value: typeExpenses[type],
    }));
  };

  const weeklyExpenses = calculateWeeklyExpenses();
  const expensesByUnit = calculateExpensesByUnit();
  const expensesByType = calculateExpensesByType();

  const totalExpenses = mockAppointments.reduce((sum, app) => sum + app.cost, 0);
  const averageExpense = totalExpenses / mockAppointments.length;

  const handleExport = (format: string, dataTypes: string[]) => {
    console.log(`Exporting ${dataTypes.join(', ')} in ${format} format`);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="rounded-lg mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Relatórios Avançados
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Análise detalhada com métricas de performance e previsões
        </p>
      </div>

      <AdvancedFilters onFiltersChange={handleFiltersChange} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mx-1 xl:-mx-3 px-1 sm:px-2">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Total de Despesas</CardTitle>
                  <DollarSign className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">R$ {totalExpenses.toFixed(2)}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    Este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Média por Exame</CardTitle>
                  <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">R$ {averageExpense.toFixed(2)}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    Por procedimento
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Agendamentos</CardTitle>
                  <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{mockAppointments.length}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    Total registrado
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Mais Caro</CardTitle>
                  <FileText className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Colonoscopia</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    R$ 550,00
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                  Análise de Despesas
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Visualização detalhada das despesas por período e categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Tabs value={reportType} onValueChange={setReportType}>
                  <div className="overflow-x-auto mx-1 xl:-mx-3 px-1 sm:px-2">
                    <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto bg-neutral-50 dark:bg-neutral-800">
                      <TabsTrigger value="weekly" className="text-xs sm:text-sm">
                        Semana
                      </TabsTrigger>
                      <TabsTrigger value="byUnit" className="text-xs sm:text-sm">
                        Por Unidade
                      </TabsTrigger>
                      <TabsTrigger value="byType" className="text-xs sm:text-sm">
                        Por Tipo
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="weekly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={weeklyExpenses}
                      title="Despesas Semanais"
                      description="Gastos previstos para os próximos 7 dias"
                    />
                  </TabsContent>

                  <TabsContent value="byUnit" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={expensesByUnit}
                      title="Despesas por Unidade"
                      description="Gastos distribuídos por unidade"
                    />
                  </TabsContent>

                  <TabsContent value="byType" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={expensesByType}
                      title="Despesas por Tipo de Exame"
                      description="Distribuição de gastos por categoria"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                  Agendamentos Recentes
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Últimos procedimentos registrados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <ScrollArea className="h-[300px] w-full">
                  <div className="space-y-3">
                    {mockAppointments.map((app) => (
                      <div
                        key={app.id}
                        className="border-l-4 border-l-blue-500 pl-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-r-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {app.patient}
                            </span>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              {format(app.date, "dd/MM/yyyy")} · {app.type}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                              R$ {app.cost.toFixed(2)}
                            </span>
                            <Badge
                              variant="outline"
                              className={`block mt-1 text-xs ${
                                app.status === 'Concluído'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                              }`}
                            >
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
