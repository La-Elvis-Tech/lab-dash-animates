import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Building, Database, FileText, User, Stethoscope, DollarSign } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExamsStats from "@/components/exams/ExamsStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  patient: string;
  type: string;
  date: Date;
  doctor: string;
  laboratory: string;
  unit: string;
  cost: number;
  status: string;
  result: string;
}

const Requests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>('Todos Exames');
  const [selectedUnit, setSelectedUnit] = useState<string>('Todas Unidades');
  const [selectedLaboratory, setSelectedLaboratory] = useState<string>('Todos Labs');

  // Buscar dados de appointments do Supabase
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['appointments-requests'],
    queryFn: async (): Promise<Exam[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          scheduled_date,
          cost,
          status,
          notes,
          exam_types(name),
          doctors(name),
          units(name, code)
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      return data?.map(appointment => ({
        id: appointment.id,
        patient: appointment.patient_name,
        type: appointment.exam_types?.name || 'Exame',
        date: new Date(appointment.scheduled_date),
        doctor: appointment.doctors?.name || 'Médico',
        laboratory: 'LabTech', // Valor padrão - em produção viria de uma tabela
        unit: appointment.units?.name || 'Unidade',
        cost: appointment.cost || 0,
        status: appointment.status || 'Agendado',
        result: appointment.status === 'Concluído' ? 'Normal' : '-'
      })) || [];
    }
  });

  // Buscar tipos de exame únicos
  const { data: examTypes = [] } = useQuery({
    queryKey: ['exam-types-filter'],
    queryFn: async () => {
      const { data } = await supabase
        .from('exam_types')
        .select('name')
        .eq('active', true);
      
      const types = ['Todos Exames'];
      if (data) {
        types.push(...data.map(type => type.name));
      }
      return types;
    }
  });

  // Buscar unidades únicas
  const { data: units = [] } = useQuery({
    queryKey: ['units-filter'],
    queryFn: async () => {
      const { data } = await supabase
        .from('units')
        .select('name')
        .eq('active', true);
      
      const unitsList = ['Todas Unidades'];
      if (data) {
        unitsList.push(...data.map(unit => unit.name));
      }
      return unitsList;
    }
  });

  const laboratories = [
    'Todos Labs',
    'LabTech',
    'BioLab',
    'MedDiag',
    'ImageLab',
    'CardioLab'
  ];

  // Filter exams based on search, date, type, unit and laboratory
  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exam.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.laboratory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.unit.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = selectedDate 
      ? exam.date.toDateString() === selectedDate.toDateString() 
      : true;
    
    const matchesType = selectedType === 'Todos Exames' || exam.type === selectedType;
    
    const matchesUnit = selectedUnit === 'Todas Unidades' || exam.unit === selectedUnit;
    
    const matchesLaboratory = selectedLaboratory === 'Todos Labs' || exam.laboratory === selectedLaboratory;
    
    return matchesSearch && matchesDate && matchesType && matchesUnit && matchesLaboratory;
  });

  // Calculate total cost of filtered exams
  const totalCost = filteredExams.reduce((sum, exam) => sum + exam.cost, 0);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
    setSelectedType('Todos Exames');
    setSelectedUnit('Todas Unidades');
    setSelectedLaboratory('Todos Labs');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Exames</h1>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Exames</h1>
      </div>
      
      <ExamsStats exams={exams} />
      
      <Card className="overflow-hidden bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 p-4">
          <CardTitle className="text-base md:text-xl">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Buscar por paciente, médico, tipo de exame..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border rounded-md font-normal bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal text-xs md:text-sm h-9 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
                        !selectedDate && "text-neutral-500 dark:text-neutral-400"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Filtrar por data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[130px] md:w-[180px] h-9 text-xs md:text-sm font-normal bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="Tipo de exame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-[130px] md:w-[180px] h-9 text-xs md:text-sm font-normal bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <Select value={selectedLaboratory} onValueChange={setSelectedLaboratory}>
                  <SelectTrigger className="w-[130px] md:w-[180px] h-9 text-xs md:text-sm font-normal bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="Laboratório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {laboratories.map((lab) => (
                        <SelectItem key={lab} value={lab}>
                          {lab}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="whitespace-nowrap text-xs md:text-sm h-9 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  size="sm"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="p-3 md:py-4 px-6 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-sm md:text-base text-neutral-600 dark:text-neutral-300">
                Exames encontrados: <strong>{filteredExams.length}</strong>
              </span>
            </div>
            <div>
              <span className="text-sm md:text-base font-medium">
                Total de despesas: <strong className="text-emerald-600 dark:text-emerald-400">R$ {totalCost.toFixed(2)}</strong>
              </span>
            </div>
          </div>
          
          <div className="p-6 bg-white dark:bg-neutral-900/50">
            <ScrollArea className="h-[600px] w-full">
              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => (
                    <Card key={exam.id} className="relative bg-white dark:bg-neutral-900/50 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600 border-neutral-200 dark:border-neutral-800">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {exam.type}
                              </CardTitle>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                ID: {exam.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`text-xs ${
                            exam.status === 'Concluído' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : exam.status === 'Em andamento'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {exam.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{exam.patient}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{exam.doctor}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{exam.unit}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{exam.laboratory}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                R$ {exam.cost.toFixed(2)}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {format(exam.date, "dd/MM/yyyy")}
                            </span>
                          </div>
                          
                          {exam.result !== '-' && (
                            <div className="pt-2">
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">Resultado: </span>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{exam.result}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">Nenhum exame encontrado com os filtros aplicados.</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Requests;
