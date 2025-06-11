
import React, { useEffect, useRef } from "react";
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

interface ConsumptionData {
  name: string;
  value: number;
}

const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  const consumptionData: ConsumptionData[] = [
    { name: "Jan", value: 23 },
    { name: "Fev", value: 34 },
    { name: "Mar", value: 45 },
    { name: "Abr", value: 31 },
    { name: "Mai", value: 42 },
    { name: "Jun", value: 52 },
    { name: "Jul", value: 49 },
  ];

  return (
    <div
      ref={dashboardRef}
      className="space-y-4 md:space-y-6 dark:text-gray-100"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          Visão geral do consumo de itens laboratoriais
        </p>
      </div>

      {/* Unit Selector */}
      <div className="dashboard-card">
        <UnitSelectorCard />
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="dashboard-card">
          <DemandForecastCard />
        </div>
        <div className="dashboard-card">
          <ForecastPerformanceCard />
        </div>
        <div className="dashboard-card">
          <QuickActionsCard />
        </div>
      </div>

      {/* Risk Alerts Section */}
      <div className="dashboard-card">
        <RiskAlertsCard />
      </div>

      {/* Key metrics and charts section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex w-full xl:w-[55%] 2xl:w-[65%]">
          <div className="flex-row w-full">
            <div className="dashboard-chart 2xl:w-[100%] border-none">
              <DashboardStats />
            </div>
            <InventoryGauges />
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="dashboard-chart max-h-auto w-full xl:w-[45%] 2xl:w-[35%]">
          <RecentActivities />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Charts section */}
        <div className="dashboard-chart flex w-full border-none">
          <Card className="dashboard h-auto border-none w-full xl:w-[100%] bg-white bg-opacity-0 shadow-none">
            <CardContent className="dashboard-chart p-0">
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

      {/* Items running low table */}
      <div className="dashboard-chart">
        <LowStockTable />
      </div>
    </div>
  );
};

export default Dashboard;
