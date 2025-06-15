import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExamsStats from '@/components/exams/ExamsStats';
import ExamDetailsCard from '@/components/exams/ExamDetailsCard';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import { useQuery } from '@tanstack/react-query';
import { examDetailsService } from '@/services/examDetailsService';

const Requests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { examTypes, loading } = useSupabaseAppointments();

  const { data: detailedExams, isLoading: detailsLoading } = useQuery({
    queryKey: ['detailed-exams'],
    queryFn: () => examDetailsService.getAllExamsWithMaterials(),
    enabled: examTypes.length > 0
  });

  const categories = [
    { id: 'all', name: 'Todos', count: examTypes.length },
    { id: 'Hematologia', name: 'Hematologia', count: examTypes.filter(e => e.category === 'Hematologia').length },
    { id: 'Bioquímica', name: 'Bioquímica', count: examTypes.filter(e => e.category === 'Bioquímica').length },
    { id: 'Endocrinologia', name: 'Endocrinologia', count: examTypes.filter(e => e.category === 'Endocrinologia').length },
    { id: 'Cardiologia', name: 'Cardiologia', count: examTypes.filter(e => e.category === 'Cardiologia').length },
    { id: 'Uroanálise', name: 'Uroanálise', count: examTypes.filter(e => e.category === 'Uroanálise').length },
    { id: 'Microbiologia', name: 'Microbiologia', count: examTypes.filter(e => e.category === 'Microbiologia').length },
  ];

  const filteredExams = detailedExams?.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading || detailsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando exames...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Tipos de Exames
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerencie os tipos de exames disponíveis no laboratório
        </p>
      </div>

      <ExamsStats examTypes={examTypes} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4 bg-neutral-100/80 dark:bg-neutral-800/80">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 transform text-gray-400" size={18} />
              <Input
                placeholder="Buscar exame..."
                className="pl-10 w-full rounded-md bg-white dark:bg-neutral-700/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? "bg-lab-blue text-white dark:bg-lab-blue/80"
                      : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-neutral-700/80 dark:text-gray-300 dark:hover:bg-gray-700"
                  } rounded-md transition-colors`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <ExamDetailsCard
            key={exam.id}
            exam={exam}
            onSchedule={() => {
              // TODO: Implementar navegação para agendamento
              console.log('Agendar exame:', exam.name);
            }}
          />
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum exame encontrado com os filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default Requests;
