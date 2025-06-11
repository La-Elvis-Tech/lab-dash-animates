import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin } from "lucide-react";

interface Unit {
  id: string;
  name: string;
  location: string;
  healthPercent: number;
  status: "excellent" | "good" | "warning" | "critical";
}

const UnitSelectorCard: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  const units: Unit[] = [
    {
      id: "all",
      name: "Todas as Unidades",
      location: "Geral",
      healthPercent: 87,
      status: "good",
    },
    {
      id: "lab1",
      name: "Laboratório Central",
      location: "Ala A",
      healthPercent: 92,
      status: "excellent",
    },
    {
      id: "lab2",
      name: "Lab. Microbiologia",
      location: "Ala B",
      healthPercent: 78,
      status: "warning",
    },
    {
      id: "lab3",
      name: "Lab. Química Clínica",
      location: "Ala C",
      healthPercent: 95,
      status: "excellent",
    },
    {
      id: "clinic1",
      name: "Clínica Norte",
      location: "Sede 2",
      healthPercent: 65,
      status: "critical",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bom";
      case "warning":
        return "Atenção";
      case "critical":
        return "Crítico";
      default:
        return "Normal";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
          <Building2
            size={18}
            className="text-indigo-600 dark:text-indigo-400"
          />
          Unidades
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status por Unidade
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900">
              {units
                .filter((unit) => unit.id !== "all")
                .map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 bg-gray-300/40 dark:bg-neutral-900/60 rounded-xl mb-2 last:mb-0 border border-gray-200 dark:border-neutral-900 transition-colors hover:bg-gray-300/80 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-neutral-700 rounded-lg text-indigo-600 dark:text-indigo-300">
                        <MapPin size={14} />
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-neutral-300">
                          {unit.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {unit.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {unit.healthPercent}%
                      </span>
                      <Badge className={getStatusColor(unit.status)}>
                        {getStatusText(unit.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitSelectorCard;
