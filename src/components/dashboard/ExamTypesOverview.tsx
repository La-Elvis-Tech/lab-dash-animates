
import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, FlaskConical } from "lucide-react";

interface ExamTypeOverview {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  cost: number;
  appointment_count: number;
}

const ExamTypesOverview: React.FC = () => {
  const { data: examTypes, isLoading } = useQuery({
    queryKey: ['exam-types-overview'],
    queryFn: async (): Promise<ExamTypeOverview[]> => {
      // Buscar tipos de exames
      const { data: exams, error: examsError } = await supabase
        .from('exam_types')
        .select('id, name, category, duration_minutes, cost')
        .eq('active', true)
        .order('name')
        .limit(5);

      if (examsError) throw examsError;

      // Buscar contagem de agendamentos por tipo
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('exam_type_id, status')
        .in('exam_type_id', exams?.map(e => e.id) || []);

      if (appointmentsError) throw appointmentsError;

      return exams?.map(exam => {
        const appointmentCount = appointments?.filter(app => 
          app.exam_type_id === exam.id && app.status !== 'Cancelado'
        ).length || 0;

        return {
          ...exam,
          appointment_count: appointmentCount
        };
      }) || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Carregando...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="p-2 text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
            Tipos de Exames Principais
          </h2>
          <Link
            to="/requests"
            className="text-xs sm:text-sm px-3 text-lab-blue dark:text-blue-300 hover:underline"
          >
            Ver Todos
          </Link>
        </div>
        <div className="p-2 space-y-3">
          {examTypes?.map((exam) => (
            <div key={exam.id} className="p-3 bg-gray-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {exam.name}
                  </h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {exam.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {exam.appointment_count} agendamentos
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {exam.duration_minutes}min
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  R$ {exam.cost?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ExamTypesOverview;
