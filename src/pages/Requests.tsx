import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Building, Database, FileText, User, Stethoscope, DollarSign, Filter, X, ChevronDown } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);

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

  // Count active filters
  const activeFiltersCount = [
    selectedDate,
    selectedType !== 'Todos Exames',
    selectedUnit !== 'Todas Unidades',
    selectedLaboratory !== 'Todos Labs'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header moderno com gradiente */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Sistema de Exames
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
              Gerencie e acompanhe todos os exames médicos em tempo real
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Stats Cards elevados */}
        <div className="mb-8">
          <ExamsStats exams={exams} />
        </div>

        {/* Barra de pesquisa moderna */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Pesquisa principal */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar paciente, médico, tipo de exame..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                />
              </div>

              {/* Botão de filtros */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="h-12 px-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200"
              >
                <Filter className="mr-2 h-5 w-5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-500 hover:bg-blue-600 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Painel de filtros expansível */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Filtro de data */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg",
                            !selectedDate && "text-muted-foreground",
                            selectedDate && "border-blue-500 dark:border-blue-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Filtro de tipo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Exame</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className={cn(
                        "h-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg",
                        selectedType !== 'Todos Exames' && "border-blue-500 dark:border-blue-400"
                      )}>
                        <SelectValue />
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
                  </div>

                  {/* Filtro de unidade */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unidade</label>
                    <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                      <SelectTrigger className={cn(
                        "h-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg",
                        selectedUnit !== 'Todas Unidades' && "border-blue-500 dark:border-blue-400"
                      )}>
                        <SelectValue />
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
                  </div>

                  {/* Filtro de laboratório */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Laboratório</label>
                    <Select value={selectedLaboratory} onValueChange={setSelectedLaboratory}>
                      <SelectTrigger className={cn(
                        "h-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg",
                        selectedLaboratory !== 'Todos Labs' && "border-blue-500 dark:border-blue-400"
                      )}>
                        <SelectValue />
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
                  </div>
                </div>

                {/* Botão de limpar filtros */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="ghost" 
                      onClick={resetFilters}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-xl border-0 rounded-2xl">
          <CardContent className="p-0">
            {/* Barra de informações */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {filteredExams.length} exames encontrados
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {totalCost.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">total</span>
                </div>
              </div>
            </div>
            
            {/* Grid de exames */}
            <div className="p-6">
              <ScrollArea className="h-[600px] w-full">
                {filteredExams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => (
                      <Card key={exam.id} className="group relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:scale-[1.02]">
                        {/* Status indicator */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                          exam.status === 'Concluído' 
                            ? 'bg-gradient-to-r from-green-400 to-green-600' 
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        }`}></div>
                        
                        <CardHeader className="pb-3 pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className={`p-3 rounded-xl ${
                                exam.status === 'Concluído' 
                                  ? 'bg-green-100 dark:bg-green-900/30' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30'
                              }`}>
                                <FileText className={`h-5 w-5 ${
                                  exam.status === 'Concluído' 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-yellow-600 dark:text-yellow-400'
                                }`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                  {exam.type}
                                </CardTitle>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  #{exam.id}
                                </p>
                              </div>
                            </div>
                            <Badge className={`text-xs font-semibold ${
                              exam.status === 'Concluído' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            }`} variant="secondary">
                              {exam.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Paciente */}
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Paciente</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{exam.patient}</p>
                            </div>
                          </div>
                          
                          {/* Médico */}
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Stethoscope className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Médico</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{exam.doctor}</p>
                            </div>
                          </div>
                          
                          {/* Data */}
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <CalendarIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Data</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{format(exam.date, "dd/MM/yyyy")}</p>
                            </div>
                          </div>
                          
                          {/* Laboratório e Unidade */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <Database className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Lab</p>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">{exam.laboratory}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <Building className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              <div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Unidade</p>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">{exam.unit}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Custo e Resultado */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                R$ {exam.cost.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resultado</p>
                              <span className={`text-sm font-bold ${
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
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nenhum exame encontrado
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      Tente ajustar os filtros ou realizar uma nova busca para encontrar os exames desejados.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Requests;
