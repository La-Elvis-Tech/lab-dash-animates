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
  // Remover dependência de examDetailsService para simplificar exibição de exames (se examTypes já contém tudo)
  // Se precisar dos detalhes, corrigir aqui depois

  // Garante que examTypes sempre é um array
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-400">Carregando exames...</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(examTypes) || examTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-gray-500">Nenhum exame cadastrado.</span>
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'Todos', count: examTypes.length },
    ...Array.from(new Set(examTypes.map(e => e.category)))
      .filter(Boolean)
      .map(category => ({
        id: category,
        name: category,
        count: examTypes.filter(e => e.category === category).length
      })),
  ];

  const filteredExams = examTypes.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase())
      || (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

      <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <input
            placeholder="Buscar exame..."
            className="pl-8 pr-3 py-2 w-full rounded-md border bg-white dark:bg-neutral-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-2 top-2.5 text-blue-400">
            <Search size={18} />
          </span>
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded-md border px-3 py-2 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-100 min-w-[140px]"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

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
