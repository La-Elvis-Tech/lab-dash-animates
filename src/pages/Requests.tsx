
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search } from "lucide-react";
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

// Mock data for exams
const mockExams = [
  { 
    id: '001',
    patient: 'João Silva',
    type: 'Hemograma',
    date: new Date(2024, 4, 15), 
    doctor: 'Dra. Ana Souza',
    status: 'Concluído',
    result: 'Normal'
  },
  { 
    id: '002',
    patient: 'Maria Santos',
    type: 'Glicemia',
    date: new Date(2024, 4, 16), 
    doctor: 'Dr. Carlos Mendes',
    status: 'Concluído',
    result: 'Alterado'
  },
  { 
    id: '003',
    patient: 'Pedro Oliveira',
    type: 'Colonoscopia',
    date: new Date(2024, 4, 17), 
    doctor: 'Dra. Lucia Freitas',
    status: 'Pendente',
    result: '-'
  },
  { 
    id: '004',
    patient: 'Ana Pereira',
    type: 'Ultrassom',
    date: new Date(2024, 4, 18), 
    doctor: 'Dr. Roberto Castro',
    status: 'Concluído',
    result: 'Normal'
  },
  { 
    id: '005',
    patient: 'Carlos Ribeiro',
    type: 'Raio-X',
    date: new Date(2024, 4, 19), 
    doctor: 'Dra. Fernanda Lima',
    status: 'Concluído',
    result: 'Alterado'
  },
  { 
    id: '006',
    patient: 'Luiza Martins',
    type: 'Eletrocardiograma',
    date: new Date(2024, 4, 20), 
    doctor: 'Dr. Paulo Vieira',
    status: 'Pendente',
    result: '-'
  },
];

// Exam types for filtering
const examTypes = [
  'Todos',
  'Hemograma',
  'Glicemia',
  'Colonoscopia',
  'Ultrassom',
  'Raio-X',
  'Eletrocardiograma'
];

const Requests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [exams, setExams] = useState(mockExams);

  // Filter exams based on search, date, and type
  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exam.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = selectedDate 
      ? exam.date.toDateString() === selectedDate.toDateString() 
      : true;
    
    const matchesType = selectedType === 'Todos' || exam.type === selectedType;
    
    return matchesSearch && matchesDate && matchesType;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
    setSelectedType('Todos');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Últimos Exames</h1>
      </div>
      
      <Card className="overflow-hidden dark:bg-gray-800 dark:text-gray-100">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
          <CardTitle className="text-xl flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, médico, tipo de exame..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Date filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
              
              {/* Type filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
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
              
              {/* Reset filters button */}
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="whitespace-nowrap"
              >
                Limpar filtros
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <TableRow key={exam.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <TableCell>{exam.id}</TableCell>
                      <TableCell>{exam.patient}</TableCell>
                      <TableCell>{exam.type}</TableCell>
                      <TableCell>{format(exam.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{exam.doctor}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exam.status === 'Concluído' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {exam.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`${
                          exam.result === 'Alterado' 
                            ? 'text-red-600 dark:text-red-400' 
                            : exam.result === 'Normal'
                              ? 'text-green-600 dark:text-green-400'
                              : ''
                        }`}>
                          {exam.result}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500 dark:text-gray-400">
                      Nenhum exame encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Requests;
