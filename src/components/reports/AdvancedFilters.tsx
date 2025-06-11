
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface FilterState {
  dateRange: DateRange | undefined;
  examTypes: string[];
  units: string[];
  items: string[];
  costRange: number[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    examTypes: [],
    units: [],
    items: [],
    costRange: [0, 1000]
  });

  const examTypes = ["Coleta de Sangue", "Ultrassom", "Raio-X", "Tomografia", "Mamografia"];
  const units = ["Unidade Centro", "Unidade Norte", "Unidade Sul", "Unidade Leste"];

  const handleExamTypeChange = (examType: string, checked: boolean) => {
    const newExamTypes = checked 
      ? [...filters.examTypes, examType]
      : filters.examTypes.filter(t => t !== examType);
    
    const newFilters = { ...filters, examTypes: newExamTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleUnitChange = (unit: string, checked: boolean) => {
    const newUnits = checked 
      ? [...filters.units, unit]
      : filters.units.filter(u => u !== unit);
    
    const newFilters = { ...filters, units: newUnits };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      dateRange: undefined,
      examTypes: [],
      units: [],
      items: [],
      costRange: [0, 1000]
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="mb-6 bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
          <Filter size={20} />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Período</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd/MM/yyyy")} - {format(filters.dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    "Selecionar período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-neutral-800" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => {
                    const newFilters = { ...filters, dateRange: range };
                    setFilters(newFilters);
                    onFiltersChange(newFilters);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tipos de Exame</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {examTypes.map((examType) => (
                <div key={examType} className="flex items-center space-x-2">
                  <Checkbox
                    id={examType}
                    checked={filters.examTypes.includes(examType)}
                    onCheckedChange={(checked) => handleExamTypeChange(examType, !!checked)}
                  />
                  <label htmlFor={examType} className="text-sm text-neutral-700 dark:text-neutral-300">{examType}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unidades</label>
            <div className="space-y-2">
              {units.map((unit) => (
                <div key={unit} className="flex items-center space-x-2">
                  <Checkbox
                    id={unit}
                    checked={filters.units.includes(unit)}
                    onCheckedChange={(checked) => handleUnitChange(unit, !!checked)}
                  />
                  <label htmlFor={unit} className="text-sm text-neutral-700 dark:text-neutral-300">{unit}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Faixa de Custo: R$ {filters.costRange[0]} - R$ {filters.costRange[1]}
            </label>
            <Slider
              value={filters.costRange}
              onValueChange={(value) => {
                const newFilters = { ...filters, costRange: value };
                setFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Filtros ativos:</span>
          {filters.examTypes.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              {type}
              <X size={12} className="cursor-pointer" onClick={() => handleExamTypeChange(type, false)} />
            </Badge>
          ))}
          {filters.units.map((unit) => (
            <Badge key={unit} variant="secondary" className="flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
              {unit}
              <X size={12} className="cursor-pointer" onClick={() => handleUnitChange(unit, false)} />
            </Badge>
          ))}
          {(filters.examTypes.length > 0 || filters.units.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-600 dark:text-neutral-400">
              Limpar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
