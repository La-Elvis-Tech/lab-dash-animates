
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
    { id: "all", name: "Todas as Unidades", location: "Geral", healthPercent: 87, status: "good" },
    { id: "lab1", name: "Laboratório Central", location: "Ala A", healthPercent: 92, status: "excellent" },
    { id: "lab2", name: "Lab. Microbiologia", location: "Ala B", healthPercent: 78, status: "warning" },
    { id: "lab3", name: "Lab. Química Clínica", location: "Ala C", healthPercent: 95, status: "excellent" },
    { id: "clinic1", name: "Clínica Norte", location: "Sede 2", healthPercent: 65, status: "critical" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "good": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent": return "Excelente";
      case "good": return "Bom";
      case "warning": return "Atenção";
      case "critical": return "Crítico";
      default: return "Normal";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <Building2 size={16} />
          Unidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{unit.name}</span>
                    <Badge className={getStatusColor(unit.status)}>
                      {unit.healthPercent}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
              Status por Unidade
            </div>
            {units.filter(unit => unit.id !== "all").map((unit) => (
              <div key={unit.id} className="flex items-center justify-between p-2 bg-white dark:bg-indigo-800/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-indigo-500" />
                  <div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {unit.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {unit.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
      </CardContent>
    </Card>
  );
};

export default UnitSelectorCard;
