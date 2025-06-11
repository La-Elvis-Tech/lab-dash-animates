
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CalendarCheck, Stethoscope, Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { recentActivity } from "@/data/recentActivity";

const RecentActivities: React.FC = () => {
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
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Recentes
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Atividades recentes
        </p>
      </div>

      <div className="md:max-h-[800px] xl:max-h-[510px] overflow-y-auto pr-3 xl:pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
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
  );
};

export default RecentActivities;
