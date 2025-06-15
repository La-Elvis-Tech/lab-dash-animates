
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
import { addDays, format, startOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Calendar, DollarSign, FileText, Package, AlertTriangle, Users, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import DashboardChart from "@/components/DashboardChart";

// Import components
import AdvancedFilters from "@/components/reports/AdvancedFilters";
import PerformanceMetrics from "@/components/reports/PerformanceMetrics";
import CostAnalysis from "@/components/reports/CostAnalysis";
import ExportControls from "@/components/reports/ExportControls";

const Reports = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("weekly");
  const [filters, setFilters] = useState({});
  const today = startOfDay(new Date());

  // Buscar dados de agendamentos
  const { data: appointments = [] } = useQuery({
    queryKey: ['reports-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          scheduled_date,
          cost,
          status,
          created_at,
          exam_types(name, category, cost),
          doctors(name, specialty),
          units(name, code)
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Buscar dados de inventário
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['reports-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          name,
          current_stock,
          min_stock,
          cost_per_unit,
          expiry_date,
          created_at,
          inventory_categories(name),
          units(name)
        `)
        .eq('active', true);

      if (error) throw error;
      return data || [];
    }
  });

  // Buscar movimentações de estoque
  const { data: movements = [] } = useQuery({
    queryKey: ['reports-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          movement_type,
          quantity,
          total_cost,
          created_at,
          reason,
          inventory_items(name, inventory_categories(name))
        `)
        .gte('created_at', subMonths(new Date(), 6).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Buscar alertas
  const { data: alerts = [] } = useQuery({
    queryKey: ['reports-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          id,
          title,
          alert_type,
          priority,
          status,
          created_at,
          inventory_items(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

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

  // Calcular métricas de agendamentos
  const appointmentMetrics = {
    total: appointments.length,
    thisMonth: appointments.filter(app => {
      const date = new Date(app.scheduled_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    completed: appointments.filter(app => app.status === 'Concluído').length,
    revenue: appointments
      .filter(app => app.status === 'Concluído')
      .reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0),
    monthlyRevenue: appointments
      .filter(app => {
        const date = new Date(app.scheduled_date);
        const now = new Date();
        return app.status === 'Concluído' && 
               date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0)
  };

  // Calcular métricas de inventário
  const inventoryMetrics = {
    totalItems: inventoryData.length,
    lowStock: inventoryData.filter(item => item.current_stock <= item.min_stock).length,
    expiringSoon: inventoryData.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const thirtyDaysFromNow = addDays(new Date(), 30);
      return expiryDate <= thirtyDaysFromNow;
    }).length,
    totalValue: inventoryData.reduce((sum, item) => 
      sum + (item.current_stock * (item.cost_per_unit || 0)), 0
    )
  };

  // Calcular dados para gráficos
  const calculateWeeklyRevenue = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dayAppointments = appointments.filter(app => {
        const appDate = new Date(app.scheduled_date);
        return appDate.toDateString() === date.toDateString() && app.status === 'Concluído';
      });
      const revenue = dayAppointments.reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0);
      
      return {
        name: format(date, 'dd/MM'),
        value: revenue
      };
    });
    return last7Days;
  };

  const calculateAppointmentsByType = () => {
    const typeCount: { [key: string]: number } = {};
    appointments.forEach(app => {
      const type = app.exam_types?.name || 'Outros';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.entries(typeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const calculateMonthlyTrends = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthAppointments = appointments.filter(app => {
        const appDate = new Date(app.scheduled_date);
        return appDate >= monthStart && appDate <= monthEnd;
      });

      const revenue = monthAppointments
        .filter(app => app.status === 'Concluído')
        .reduce((sum, app) => sum + (app.cost || app.exam_types?.cost || 0), 0);

      return {
        name: format(date, 'MMM'),
        appointments: monthAppointments.length,
        revenue: revenue
      };
    });
    return last6Months;
  };

  const calculateInventoryByCategory = () => {
    const categoryCount: { [key: string]: number } = {};
    inventoryData.forEach(item => {
      const category = item.inventory_categories?.name || 'Outros';
      categoryCount[category] = (categoryCount[category] || 0) + item.current_stock;
    });

    const total = Object.values(categoryCount).reduce((sum, value) => sum + value, 0);
    
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ 
        name, 
        value: total > 0 ? Math.round((value / total) * 100) : 0 
      }))
      .sort((a, b) => b.value - a.value);
  };

  const weeklyRevenue = calculateWeeklyRevenue();
  const appointmentsByType = calculateAppointmentsByType();
  const monthlyTrends = calculateMonthlyTrends();
  const inventoryByCategory = calculateInventoryByCategory();

  const mostRequestedExam = appointmentsByType.length > 0 ? appointmentsByType[0].name : 'N/A';

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
          Análise detalhada com métricas de performance e dados em tempo real
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mx-1 xl:-mx-3 px-0 sm:px-2">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="cost-analysis" className="text-xs sm:text-sm">
              Análises
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm">
              Exportar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    R$ {appointmentMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    Total de exames concluídos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Agendamentos</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{appointmentMetrics.total}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {appointmentMetrics.thisMonth} este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Itens em Estoque</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{inventoryMetrics.totalItems}</div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {inventoryMetrics.lowStock} em estoque baixo
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Alertas Ativos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {alerts.filter(alert => alert.status === 'active').length}
                  </div>
                  <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {inventoryMetrics.expiringSoon} vencendo em 30 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                  Análise de Performance
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Visualização detalhada de receitas, agendamentos e estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Tabs value={reportType} onValueChange={setReportType}>
                  <div className="overflow-x-auto mx-1 xl:-mx-3 px-1 sm:px-2">
                    <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto bg-neutral-50 dark:bg-neutral-800">
                      <TabsTrigger value="weekly" className="text-xs sm:text-sm">
                        Receita Semanal
                      </TabsTrigger>
                      <TabsTrigger value="monthly" className="text-xs sm:text-sm">
                        Tendência Mensal
                      </TabsTrigger>
                      <TabsTrigger value="byType" className="text-xs sm:text-sm">
                        Por Tipo de Exame
                      </TabsTrigger>
                      <TabsTrigger value="inventory" className="text-xs sm:text-sm">
                        Estoque por Categoria
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="weekly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={weeklyRevenue}
                      title="Receita dos Últimos 7 Dias"
                      description="Receita diária de exames concluídos"
                    />
                  </TabsContent>

                  <TabsContent value="monthly" className="mt-0">
                    <DashboardChart
                      type="bar"
                      data={monthlyTrends.map(item => ({ name: item.name, value: item.revenue }))}
                      title="Receita Mensal (Últimos 6 Meses)"
                      description="Evolução da receita ao longo dos meses"
                    />
                  </TabsContent>

                  <TabsContent value="byType" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={appointmentsByType}
                      title="Agendamentos por Tipo de Exame"
                      description="Distribuição dos tipos de exames mais solicitados"
                    />
                  </TabsContent>

                  <TabsContent value="inventory" className="mt-0">
                    <DashboardChart
                      type="progress"
                      data={inventoryByCategory}
                      title="Distribuição de Estoque por Categoria"
                      description="Percentual de itens por categoria de inventário"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {appointments.slice(0, 10).map((app) => (
                        <div
                          key={app.id}
                          className="border-l-4 border-l-blue-500 pl-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-r-md px-4"
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
                                className={`block mt-1 text-xs ${
                                  app.status === 'Concluído'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                    : app.status === 'Cancelado'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
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

              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                    Alertas Recentes
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Últimos alertas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <ScrollArea className="h-[300px] w-full">
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`border-l-4 pl-3 py-2 rounded-r-md px-4 ${
                            alert.priority === 'critical'
                              ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
                              : alert.priority === 'high'
                              ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
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
                                className={`text-xs ${
                                  alert.priority === 'critical'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    : alert.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
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
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="cost-analysis" className="mt-0">
          <CostAnalysis />
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <ExportControls 
            data={appointments} 
            reportType={reportType} 
            onExport={handleExport} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
