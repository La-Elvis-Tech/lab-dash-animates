import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import DashboardChart from "@/components/DashboardChart.tsx";
import GaugeChart from "@/components/ui/GaugeChart";
import Chart3D from "@/components/Chart3D";
import { inventoryPercent } from "@/data/InventoryPercent";
import { Card, CardContent } from "../components/ui/card";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Package,
  Beaker,
  CalendarCheck,
  Stethoscope,
  Pill,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { recentActivity } from "@/data/recentActivity";
import { motion, AnimatePresence } from "framer-motion";

interface ConsumptionData {
  name: string;
  value: number;
}

interface InventoryData {
  name: string;
  value: number;
}

interface DepletionItem {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
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

  const inventoryData: InventoryData[] = [
    { name: "Reagentes", value: 35 },
    { name: "Vidraria", value: 28 },
    { name: "Equipamentos", value: 17 },
    { name: "Descartáveis", value: 20 },
  ];

  const itemsNearDepletion: DepletionItem[] = [
    {
      id: 1,
      name: "Etanol Absoluto",
      currentStock: 3,
      minStock: 5,
      unit: "Litros",
    },
    {
      id: 2,
      name: "Luvas de Nitrila",
      currentStock: 10,
      minStock: 50,
      unit: "Pares",
    },
    {
      id: 3,
      name: "Placas de Petri",
      currentStock: 15,
      minStock: 25,
      unit: "Unidades",
    },
    {
      id: 4,
      name: "Tubos de Ensaio",
      currentStock: 8,
      minStock: 20,
      unit: "Unidades",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activities] = useState(recentActivity);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getIcon = (title: string) => {
    switch (title) {
      case "Agendamento":
        return <CalendarCheck className="w-5 h-5" />;
      case "Exame":
        return <Stethoscope className="w-5 h-5" />;
      case "Reposição":
        return <Pill className="w-5 h-5" />;
      default:
        return <CalendarCheck className="w-5 h-5" />;
    }
  };

  const formatDateLabel = (dateString: string) => {
    const today = new Date();
    const [day, month, year] = dateString.split("/");
    const activityDate = new Date(`${year}-${month}-${day}`);

    const diffTime = today.getTime() - activityDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    return activityDate.toLocaleDateString("pt-BR", { weekday: "long" });
  };

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

      {/* Key metrics and charts section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex w-full xl:w-[55%] 2xl:w-[65%]">
          <div className="flex-row w-full">
            <div className="dashboard-chart 2xl:w-[100%] border-none">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-4">
                <Card className="dashboard-card bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80  dark:border-neutral-700 dark:border-opacity-20 ">
                  <CardContent className="pt-4 sm:pt-5 p-3 md:p-4 ">
                    <div className="flex items-center justify-between px-2 ">
                      <div>
                        <p className="text-md sm:text-md font-medium text-gray-500 dark:text-gray-400">
                          Total de Itens
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-700 dark:text-white">
                          1,284
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                          <TrendingUp size={12} className="mr-1" />
                          +2.5% este mês
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dashboard-card bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80  dark:border-neutral-700 dark:border-opacity-20 ">
                  <CardContent className="pt-4 sm:pt-5 p-3 sm:p-4 md:p-4">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <p className="text-md sm:text-md font-medium text-gray-500 dark:text-gray-400">
                          Consumo Mensal
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-700 dark:text-white">
                          187
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <TrendingDown size={12} className="mr-1" />
                          -1.8% este mês
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dashboard-card bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80  dark:border-neutral-700 dark:border-opacity-20 ">
                  <CardContent className="pt-4 sm:pt-5 p-3 sm:p-4 md:p-5">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <p className="text-md sm:text-md font-medium text-gray-500 dark:text-gray-400">
                          Reagentes
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-700 dark:text-white">
                          362
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                          <TrendingUp size={12} className="mr-1" />
                          +5.2% este mês
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dashboard-card bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80  dark:border-neutral-700 dark:border-opacity-20 ">
                  <CardContent className="pt-4 sm:pt-5 p-3 sm:p-4 md:p-5">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <p className="text-md sm:text-md font-medium text-gray-500 dark:text-gray-400">
                          Em Alerta
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-700 dark:text-white">
                          12
                        </h3>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                          <AlertCircle size={12} className="mr-1" />
                          Requer atenção
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Key metrics cards */}
            {/* Gauge charts section */}
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 dashboard-chart border-none">
              <h1 className="px-6 pt-6 text-xl sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                Estoque Geral
              </h1>
              <p className="px-6 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Itens disponíveis no estoque
              </p>
              <CardContent className="dashboard-chart grid grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6 my-0 md:my-3 mt-2 md:mt-0">
                {inventoryPercent.map((item) => (
                  <div key={item.name}>
                    <div className="block sm:inline md:hidden">
                      <div className=" flex flex-col justify-center items-center md:my-0 p-4 rounded-md">
                        <GaugeChart
                          title={item.name}
                          value={item.value}
                          size={150}
                        />
                      </div>
                    </div>
                    <div className="hidden md:inline xl:hidden ">
                      <div className=" flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md">
                        <GaugeChart
                          title={item.name}
                          value={item.value}
                          size={170}
                        />
                      </div>
                    </div>
                    <div className="hidden xl:inline">
                      <div className=" flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md">
                        <GaugeChart
                          title={item.name}
                          value={item.value}
                          size={200}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Recent Activity - keep existing code */}
        <div className=" dashboard-chart max-h-auto w-full xl:w-[45%] 2xl:w-[35%] ">
          <div className="  bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950 rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Recentes
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Atividades recentes
              </p>
            </div>

            <div className=" dashboard-chart md:mah-h-[800px] xl:max-h-[510px] overflow-y-auto pr-3 xl:pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gray-300/40 dark:bg-neutral-900/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full p-4 flex items-center justify-between gap-4 hover:bg-gray-300/80 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 dark:bg-neutral-700 rounded-lg text-blue-600 dark:text-blue-300">
                          {getIcon(activity.title)}
                        </div>

                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800 dark:text-neutral-300">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateLabel(activity.date)} • {activity.time}
                          </p>
                        </div>
                      </div>

                      <motion.div
                        animate={{ rotate: expandedIndex === index ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="px-2 pt-4 bg-gray-100/90 dark:bg-neutral-800/40"
                        >
                          <div className="pl-2 xl:pl-4 pb-4 space-y-2 overflow-x-auto whitespace-nowrap">
                            {activity.description && (
                              <div className="flex gap-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Descrição:
                                </span>
                                <span className="text-gray-700 dark:text-gray-200">
                                  {activity.description}
                                </span>
                              </div>
                            )}

                            {activity.paciente && (
                              <div className="flex gap-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Paciente:
                                </span>
                                <span className="text-gray-700 dark:text-gray-200">
                                  {activity.paciente}
                                </span>
                              </div>
                            )}

                            {activity.responsavel && (
                              <div className="flex gap-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Responsável:
                                </span>
                                <span className="text-gray-700 dark:text-gray-200">
                                  {activity.responsavel}
                                </span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <span className="text-gray-500 dark:text-gray-400">
                                Dia:
                              </span>
                              <span className="text-gray-700 dark:text-gray-200">
                                {activity.date}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" flex flex-col lg:flex-row gap-6">
        {/* Charts section with 3D chart */}
        <div className="dashboard-chart flex w-full border-none">
          <Card className="dashboard h-auto border-none w-full xl:w-[100%] bg-white bg-opacity-0 shadow-none">
            <CardContent className="dashboard-chart p-0 ">
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
      {/* Items running low table - keep existing code */}
      <div className="dashboard-chart">
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950/90">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="p-2 text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                Itens em Baixo Estoque
              </h2>
              <Link
                to="/inventory"
                className="text-xs sm:text-sm px-3 text-lab-blue dark:text-blue-300 hover:underline"
              >
                Ver Todos
              </Link>
            </div>
            <div className="p-2 overflow-x-auto">
              <div className="p-0 lg:px-6 min-w-[500px] md:min-w-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-base">
                  <thead>
                    <tr className="text-gray-700 dark:text-gray-100">
                      <th
                        scope="col"
                        className="px-2 py-3 font-semibold text-left"
                      >
                        Nome do Item
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-3 font-semibold text-right"
                      >
                        Estoque Atual
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-3 font-semibold text-right"
                      >
                        Estoque Mínimo
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-3 font-semibold text-right"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {itemsNearDepletion.map((item) => (
                      <tr key={item.id}>
                        <td className="text-sm px-2 py-3 font-medium dark:text-gray-300 text-gray-800 text-left">
                          {item.name}
                        </td>
                        <td className="text-sm px-2 py-3 dark:text-gray-300 text-gray-800 text-right">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="text-sm px-2 py-3 dark:text-gray-300 text-gray-800 text-right">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100">
                            Crítico
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
