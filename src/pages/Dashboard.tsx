import React, { useState, useEffect, useRef, } from "react";
import { gsap } from "gsap";
import DashboardChart from "@/components/DashboardChart.tsx";
import GaugeChart from "@/components/ui/GaugeChart";
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
          duration: 0.6,
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
          duration: 0.8,
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

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activities] = useState(recentActivity);

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getIcon = (title) => {
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
  const formatDateLabel = (dateString) => {
    const today = new Date();
    const [day, month, year] = dateString.split("/");
    const activityDate = new Date(`${year}-${month}-${day}`);

    const diffTime = today - activityDate;
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
      {/* Key metrics - Improved responsive grid with better breakpoints */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[55%] xl:w-[70%]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 pb-4">
            <Card className="dashboard-card  bg-white bg-opacity-90 border-neutral-300/60 border-opacity-80 dark:bg-neutral-900/50 dark:border-neutral-700 dark:border-opacity-20">
              <CardContent className="pt-4 sm:pt-5 p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between px-2">
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
                  <div className="bg-lab-lightBlue dark:bg-gray-700 p-2 sm:p-3 rounded-full">
                    <Package className="text-lab-blue dark:text-blue-300 h-7 w-7 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card bg-white bg-opacity-90 border-neutral-300/60 border-opacity-80 dark:bg-neutral-900/50 dark:border-neutral-700 dark:border-opacity-20">
              <CardContent className="pt-4 sm:pt-5 p-3 sm:p-4 md:p-5">
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
                  <div className="bg-lab-lightBlue dark:bg-gray-700 p-2 sm:p-3 rounded-full">
                    <Activity className="text-lab-blue dark:text-blue-300  h-7 w-7 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card bg-white bg-opacity-90 border-neutral-300/60 border-opacity-80 dark:bg-neutral-900/50 dark:border-neutral-700 dark:border-opacity-20">
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
                  <div className="bg-lab-lightBlue dark:bg-gray-700 p-2 sm:p-3 rounded-full">
                    <Beaker className="text-lab-blue dark:text-blue-300  h-7 w-7 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card bg-white bg-opacity-90 border-neutral-300/60 border-opacity-80 dark:bg-neutral-900/50 dark:border-neutral-700 dark:border-opacity-20">
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
                  <div className="bg-red-100 dark:bg-red-900/70 p-2 sm:p-3 rounded-full">
                    <AlertCircle className="text-red-600   h-7 w-7 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white bg-opacity-90 dark:bg-neutral-900/50 dashboard-chart border-none">
          <h1 className="px-6 pt-6 text-xl sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
            Estoque Geral
          </h1>
          <p className="px-6 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Itens disponíveis no estoque
          </p>
          <CardContent className="dashboard-chart grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-4 md:gap-6 my-0 md:my-3">
            {inventoryPercent.map((item) => (
              <div>
                <div className="block sm:inline lg:hidden ">
                  <div
                    key={item.name}
                    className=" flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md"
                  >
                    <GaugeChart title={item.name} value={item.value} size={180} />
                  </div>
                </div>
                <div className="hidden lg:inline xl:hidden ">
                  <div
                    key={item.name}
                    className=" flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md"
                  >
                    <GaugeChart title={item.name} value={item.value} size={180} />
                  </div>
                </div>
                <div className="hidden xl:inline">
                  <div
                    key={item.name}
                    className=" flex flex-col justify-center items-center my-4 md:my-0 p-4 rounded-md"
                  >
                    <GaugeChart title={item.name} value={item.value} size={200} />
                  </div>
                </div>
              </div>
              
              
            ))}
          </CardContent>
        </Card>
        </div>

        {/* Recent Activity */}

        <div className=" dashboard-chart max-h-auto w-full lg:w-[45%] xl:w-[30%]">
          <div className="bg-white bg-opacity-90 dark:bg-neutral-900/50 rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Recentes
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Atividades recentes
              </p>
            </div>

            {/* Área scrollable */}
            <div className=" dashboard-chart md:mah-h-[800px] xl:max-h-[520px] overflow-y-auto pr-3 xl:pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gray-300/40 dark:bg-gray-800 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full p-4 flex items-center justify-between gap-4 hover:bg-gray-300/80 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-300">
                          {getIcon(activity.title)}
                        </div>

                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-300">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateLabel(activity.date)} • {activity.time}
                          </p>
                        </div>
                      </div>

                      {/* Ícone com rotação */}
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
                          className="px-2 pt-4 bg-gray-100/90 dark:bg-neutral-900/40"
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
      {/* Charts - Improved responsive layout with better breakpoints */}
        <Card className="bg-opacity">
          <CardContent className="dashboard-chart p-0">
            <DashboardChart
              type="line"
              data={consumptionData}
              title="Consumo de Itens"
              description="Itens consumidos nos últimos 7 meses"
            />
          </CardContent>
        </Card>

      {/* Items running low - Improved responsive table */}
      <div className="dashboard-chart">
        <Card className="bg-white bg-opacity-90 border-neutral-300/60 border-opacity-20 dark:bg-neutral-900/50 dark:border-neutral-700 dark:border-opacity-20">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                Itens em Baixo Estoque
              </h2>
              <Link
                to="/inventory"
                className="text-xs sm:text-sm px-3 text-lab-blue dark:text-blue-300 hover:underline"
              >
                Ver Todos
              </Link>
            </div>
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="text-left text-xs sm:text-sm text-gray-700 dark:text-gray-400">
                      <th scope="col" className="py-2 sm:py-3 font-semibold">
                        Nome do Item
                      </th>
                      <th
                        scope="col"
                        className="py-2 sm:py-3 font-semibold text-right"
                      >
                        Estoque Atual
                      </th>
                      <th
                        scope="col"
                        className="py-2 sm:py-3 font-semibold text-right"
                      >
                        Estoque Mínimo
                      </th>
                      <th
                        scope="col"
                        className="py-2 sm:py-3 font-semibold text-center"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {itemsNearDepletion.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium dark:text-gray-300 text-gray-800">
                          {item.name}
                        </td>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm dark:text-gray-300 text-gray-800 text-right">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm dark:text-gray-300 text-gray-800 text-right">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="py-2 sm:py-3 px-2 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
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
