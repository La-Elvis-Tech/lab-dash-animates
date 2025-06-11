
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import DashboardChart from "@/components/DashboardChart.tsx";
import { Card, CardContent } from "../components/ui/card";

// Import refactored components
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import InventoryGauges from "@/components/dashboard/InventoryGauges";
import LowStockTable from "@/components/dashboard/LowStockTable";

// Import existing dashboard components
import DemandForecastCard from "@/components/dashboard/DemandForecastCard";
import RiskAlertsCard from "@/components/dashboard/RiskAlertsCard";
import ForecastPerformanceCard from "@/components/dashboard/ForecastPerformanceCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import UnitSelectorCard from "@/components/dashboard/UnitSelectorCard";

// Data imports
import { getDashboardConsumption, type ConsumptionData } from "@/data/dashboard";

const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const consumption = await getDashboardConsumption();
        setConsumptionData(consumption);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".dashboard-chart",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dashboardRef}
      className="space-y-6 dark:text-gray-100"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          Visão geral do consumo de itens laboratoriais
        </p>
      </div>

      {/* Grid principal com layout mais equilibrado */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Coluna da esquerda - Unidades e métricas principais */}
        <div className="xl:col-span-4 space-y-6">
          <div className="dashboard-card">
            <UnitSelectorCard />
          </div>
          
          <div className="dashboard-card">
            <DashboardStats />
          </div>
          
          <div className="dashboard-card">
            <InventoryGauges />
          </div>
        </div>

        {/* Coluna central - Analytics avançados */}
        <div className="xl:col-span-5 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="dashboard-card">
              <DemandForecastCard />
            </div>
            
            <div className="dashboard-card">
              <ForecastPerformanceCard />
            </div>
          </div>

          {/* Gráfico principal */}
          <div className="dashboard-chart">
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950">
              <CardContent className="p-6">
                <DashboardChart
                  type="bar"
                  data={consumptionData}
                  title="Consumo de Itens"
                  description="Itens consumidos nos últimos 7 meses"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coluna da direita - Ações e alertas */}
        <div className="xl:col-span-3 space-y-6">
          <div className="dashboard-card">
            <QuickActionsCard />
          </div>
          
          <div className="dashboard-card">
            <RecentActivities />
          </div>
        </div>
      </div>

      {/* Seção de alertas de risco - largura total */}
      <div className="dashboard-card">
        <RiskAlertsCard />
      </div>

      {/* Tabela de estoque baixo - largura total */}
      <div className="dashboard-chart">
        <LowStockTable />
      </div>
    </div>
  );
};

export default Dashboard;
