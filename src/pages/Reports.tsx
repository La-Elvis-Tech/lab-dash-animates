
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ReportsHeader from "@/components/reports/ReportsHeader";
import MetricsCards from "@/components/reports/MetricsCards";
import PerformanceMetrics from "@/components/reports/PerformanceMetrics";
import CostAnalysis from "@/components/reports/CostAnalysis";
import ExportControls from "@/components/reports/ExportControls";
import DashboardChart from "@/components/DashboardChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { useReportsData, useReportMetrics } from "@/hooks/useReportsData";
import { useAuthContext } from "@/context/AuthContext";

const Reports = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("weekly");
  const [selectedUnit, setSelectedUnit] = useState<string>("default");
  
  const { profile, hasRole } = useAuthContext();
  
  const unitFilter = selectedUnit === "default" 
    ? undefined 
    : selectedUnit === "all" && (hasRole('admin') || hasRole('supervisor'))
    ? "all"
    : selectedUnit !== "default"
    ? selectedUnit
    : undefined;

  const { data: reportData, isLoading } = useReportsData(unitFilter);
  const metrics = reportData ? useReportMetrics(reportData) : null;

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

  const handleExport = (format: string, dataTypes: string[]) => {
    console.log(`Exporting ${dataTypes.join(', ')} in ${format} format`);
  };

  if (!reportData || !metrics) {
    return (
      <div className="min-h-screen bg-neutral-50/30 dark:bg-neutral-950/30">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="border-0 bg-white/60 dark:bg-neutral-900/30 backdrop-blur-sm shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">
                Não foi possível carregar os dados dos relatórios.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { appointmentMetrics, inventoryMetrics, chartData } = metrics;

  return (
    <div ref={pageRef} className="min-h-screen ">
      <div className="p-2 md:p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ReportsHeader
          selectedUnit={selectedUnit}
          onUnitChange={setSelectedUnit}
          units={reportData.units}
          showUnitSelector={hasRole('admin') || hasRole('supervisor')}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="mb-6 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm border-0 shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60">
                Performance
              </TabsTrigger>
              <TabsTrigger value="cost-analysis" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60">
                Análise de Custos
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800/60">
                Exportar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0 space-y-8">
            {/* Metrics Cards */}
            <MetricsCards 
              appointmentMetrics={appointmentMetrics}
              inventoryMetrics={inventoryMetrics}
              alertsCount={reportData.alerts.filter(alert => alert.status === 'active').length}
            />

            {/* Charts Section */}
            <Card className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
                  Análise de Performance
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Visualização detalhada de receitas, agendamentos e estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={reportType} onValueChange={setReportType}>
                  <div className="overflow-x-auto mb-6">
                    <TabsList className="bg-neutral-50/80 dark:bg-neutral-800/40 border-0">
                      <TabsTrigger value="weekly">Receita Semanal</TabsTrigger>
                      <TabsTrigger value="monthly">Tendência Mensal</TabsTrigger>
                      <TabsTrigger value="byType">Por Tipo de Exame</TabsTrigger>
                      <TabsTrigger value="inventory">Estoque por Categoria</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="weekly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={chartData.weeklyRevenue}
                      title="Receita dos Últimos 7 Dias"
                      description="Receita diária de exames concluídos"
                    />
                  </TabsContent>

                  <TabsContent value="monthly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={chartData.monthlyTrends.map(item => ({ name: item.name, value: item.revenue }))}
                      title="Receita Mensal (Últimos 6 Meses)"
                      description="Evolução da receita ao longo dos meses"
                    />
                  </TabsContent>

                  <TabsContent value="byType" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={chartData.appointmentsByType}
                      title="Agendamentos por Tipo de Exame"
                      description="Distribuição dos tipos de exames mais solicitados"
                    />
                  </TabsContent>

                  <TabsContent value="inventory" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={chartData.inventoryByCategory}
                      title="Distribuição de Estoque por Categoria"
                      description="Percentual de itens por categoria de inventário"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
                    Agendamentos Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos procedimentos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {reportData.appointments.slice(0, 10).map((app) => (
                        <div
                          key={app.id}
                          className="p-4 bg-white/60 dark:bg-neutral-800/30 rounded-lg border-l-4 border-l-blue-500"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                {app.patient_name}
                              </span>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {format(new Date(app.scheduled_date), "dd/MM/yyyy")} · {app.exam_types?.name || 'Exame'}
                              </div>
                              {app.doctors?.name && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Dr. {app.doctors.name}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                R$ {(app.cost || app.exam_types?.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Badge
                                variant="outline"
                                className={`block mt-1 text-xs border-0 ${
                                  app.status === 'Concluído'
                                    ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                    : app.status === 'Cancelado'
                                    ? 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    : 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
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

              <Card className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
                    Alertas Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos alertas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {reportData.alerts.slice(0, 10).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.priority === 'critical'
                              ? 'border-l-red-500 bg-red-50/80 dark:bg-red-900/20'
                              : alert.priority === 'high'
                              ? 'border-l-orange-500 bg-orange-50/80 dark:bg-orange-900/20'
                              : 'border-l-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                {alert.title}
                              </span>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {alert.inventory_items?.name} · {format(new Date(alert.created_at), "dd/MM/yyyy")}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={`text-xs border-0 ${
                                  alert.priority === 'critical'
                                    ? 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    : alert.priority === 'high'
                                    ? 'bg-orange-100/80 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                                    : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                }`}
                              >
                                {alert.priority}
                              </Badge>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {alert.alert_type}
                              </div>
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
            <PerformanceMetrics selectedUnitId={unitFilter === "all" ? undefined : unitFilter} />
          </TabsContent>

          <TabsContent value="cost-analysis" className="mt-0">
            <CostAnalysis selectedUnitId={unitFilter === "all" ? undefined : unitFilter} />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <ExportControls 
              data={reportData.appointments} 
              reportType={reportType} 
              onExport={handleExport}
              additionalData={{
                'Inventário': reportData.inventory,
                'Movimentações': reportData.movements,
                'Alertas': reportData.alerts
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
