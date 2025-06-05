
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

// Mock data for exams
const mockExams = [
  { 
    id: '001',
    patient: 'João Silva',
    type: 'Hemograma',
    date: new Date(2024, 4, 15), 
    doctor: 'Dra. Ana Souza',
    laboratory: 'LabTech',
    unit: 'Unidade Centro',
    cost: 80.00,
    status: 'Concluído',
    result: 'Normal'
  },
  { 
    id: '002',
    patient: 'Maria Santos',
    type: 'Glicemia',
    date: new Date(2024, 4, 16), 
    doctor: 'Dr. Carlos Mendes',
    laboratory: 'BioLab',
    unit: 'Unidade Norte',
    cost: 45.00,
    status: 'Concluído',
    result: 'Alterado'
  },
  { 
    id: '003',
    patient: 'Pedro Oliveira',
    type: 'Colonoscopia',
    date: new Date(2024, 4, 17), 
    doctor: 'Dra. Lucia Freitas',
    laboratory: 'MedDiag',
    unit: 'Unidade Sul',
    cost: 550.00,
    status: 'Pendente',
    result: '-'
  },
  { 
    id: '004',
    patient: 'Ana Pereira',
    type: 'Ultrassom',
    date: new Date(2024, 4, 18), 
    doctor: 'Dr. Roberto Castro',
    laboratory: 'ImageLab',
    unit: 'Unidade Leste',
    cost: 280.00,
    status: 'Concluído',
    result: 'Normal'
  },
  { 
    id: '005',
    patient: 'Carlos Ribeiro',
    type: 'Raio-X',
    date: new Date(2024, 4, 19), 
    doctor: 'Dra. Fernanda Lima',
    laboratory: 'ImageLab',
    unit: 'Unidade Centro',
    cost: 180.00,
    status: 'Concluído',
    result: 'Alterado'
  },
  { 
    id: '006',
    patient: 'Luiza Martins',
    type: 'Eletrocardiograma',
    date: new Date(2024, 4, 20), 
    doctor: 'Dr. Paulo Vieira',
    laboratory: 'CardioLab',
    unit: 'Unidade Norte',
    cost: 220.00,
    status: 'Pendente',
    result: '-'
  },
];

// Exam types for filtering
const examTypes = [
  'Todos Exames',
  'Hemograma',
  'Glicemia',
  'Colonoscopia',
  'Ultrassom',
  'Raio-X',
  'Eletrocardiograma'
];

// Units for filtering
const units = [
  'Todas Unidades',
  'Unidade Centro',
  'Unidade Norte',
  'Unidade Sul',
  'Unidade Leste'
];

// Laboratories for filtering
const laboratories = [
  'Todos Labs',
  'LabTech',
  'BioLab',
  'MedDiag',
  'ImageLab',
  'CardioLab'
];

const Requests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>('Todos Exames');
  const [selectedUnit, setSelectedUnit] = useState<string>('Todas Unidades');
  const [selectedLaboratory, setSelectedLaboratory] = useState<string>('Todos Labs');
  const [exams, setExams] = useState(mockExams);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 dark:text-white">Exames</h1>
      </div>
      
      {/* Estatísticas dos Exames */}
      <ExamsStats exams={exams} />
      
      <Card className="overflow-hidden dark:bg-gray-900 dark:text-gray-100 dark:border-none">
        <CardHeader className="bg-gray-50 dark:bg-neutral-900 border-b dark:border-gray-700 p-4">
          <CardTitle className="text-base md:text-xl">
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 " />
                <Input
                  placeholder="Buscar por paciente, médico, tipo de exame..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border rounded-md font-normal bg-gray-200 dark:bg-neutral-800/70 dark:border-transparent outline-none focus:ring-0 transition-all focus:border-transparent focus-visible:ring-blue-500 duration-200"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Date filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal text-xs md:text-sm h-9 text-gray-800 dark:text-white bg-gray-200 dark:bg-neutral-800/70 dark:border-transparent  py-2 px-3 outline-none focus:ring-hidden focus:ring-offset-1 focus:border-transparent focus-visible:ring-blue-500 transition-all duration-200",
                        !selectedDate && "text-muted-foreground"
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
                
                {/* Type filter - responsive */}
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[130px] md:w-[180px] h-9 text-xs md:text-sm font-normal text-gray-800 dark:text-white bg-gray-200 dark:bg-neutral-800/70 dark:border-transparent  py-2 px-3 outline-none focus:ring-hidden focus:ring-offset-1 focus:border-transparent focus-visible:ring-blue-500 transition-all duration-200">
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
                
                {/* Unit filter - responsive */}
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-[130px] md:w-[180px] h-9 text-xs md:text-sm font-normal text-gray-800 dark:text-white bg-gray-200 dark:bg-neutral-800/70 dark:border-transparent  py-2 px-3 outline-none focus:ring-hidden focus:ring-offset-1 focus:border-transparent focus-visible:ring-blue-500 transition-all duration-200">
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
                
                {/* Laboratory filter - responsive */}
                <Select value={selectedLaboratory} onValueChange={setSelectedLaboratory}>
                  <SelectTrigger className="w-[130px] md:w-[180px] h-9 text-xs md:text-sm font-normal text-gray-800 dark:text-white bg-gray-200 dark:bg-neutral-800/70 dark:border-transparent  py-2 px-3 outline-none focus:ring-hidden focus:ring-offset-1 focus:border-transparent focus-visible:ring-blue-500 transition-all duration-200">
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
                
                {/* Reset filters button - responsive */}
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="whitespace-nowrap text-xs md:text-sm h-9 text-gray-800 dark:text-white bg-gray-200 dark:bg-neutral-900/70"
                  size="sm"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="p-3 md:py-4 px-6 bg-gray-200 dark:bg-neutral-950/80 border-b border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-sm md:text-base text-gray-500 dark:text-gray-300">
                Exames encontrados: <strong>{filteredExams.length}</strong>
              </span>
            </div>
            <div>
              <span className="text-sm md:text-base font-medium">
                Total de despesas: <strong className="text-green-600 dark:text-green-400">R$ {totalCost.toFixed(2)}</strong>
              </span>
            </div>
          </div>
          
          <div className="p-6 dark:bg-neutral-900/60">
            <ScrollArea className="h-[600px] w-full ">
              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => (
                    <Card key={exam.id} className="relative bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                                {exam.type}
                              </CardTitle>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {exam.id}
                              </p>
                            </div>
                          </div>
                          <Badge className={`text-xs ${
                            exam.status === 'Concluído' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`} variant="secondary">
                            {exam.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 mt-2">
                        {/* Paciente */}
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div className="pl-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Paciente</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.patient}</p>
                          </div>
                        </div>
                        
                        {/* Médico */}
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div className="pl-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Médico</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.doctor}</p>
                          </div>
                        </div>
                        
                        {/* Data */}
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div className="pl-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Data</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{format(exam.date, "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                        
                        {/* Laboratório e Unidade */}
                          <div className="flex items-center space-x-2">
                            <Database className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <div className="pl-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Lab</p>
                              <p className="text-xs font-medium text-gray-900 dark:text-white">{exam.laboratory}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <div className="pl-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Unidade</p>
                              <p className="text-xs font-medium text-gray-900 dark:text-white">{exam.unit}</p>
                            </div>
                          </div>

                        {/* Custo e Resultado */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-1 mt-3">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              R$ {exam.cost.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center text-left md:text-right mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Resultado:</p>
                            <span className={`text-sm font-medium ml-3 ${
                              exam.result === 'Alterado' 
                                ? 'text-red-600 dark:text-red-400' 
                                : exam.result === 'Normal'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {exam.result}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Nenhum exame encontrado
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Tente ajustar os filtros para encontrar os exames desejados.
                  </p>
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
