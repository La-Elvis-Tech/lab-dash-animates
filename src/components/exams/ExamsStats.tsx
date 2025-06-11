
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';

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

interface ExamsStatsProps {
  exams: Exam[];
}

const ExamsStats: React.FC<ExamsStatsProps> = ({ exams }) => {
  // Calcular estatísticas dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentExams = exams.filter(exam => exam.date >= thirtyDaysAgo);
  const completedExams = recentExams.filter(exam => exam.status === 'Concluído');
  const totalCost = recentExams.reduce((sum, exam) => sum + exam.cost, 0);
  const averageCost = recentExams.length > 0 ? totalCost / recentExams.length : 0;

  // Exames por tipo (mais comuns)
  const examTypeCounts = recentExams.reduce((acc, exam) => {
    acc[exam.type] = (acc[exam.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonExam = Object.entries(examTypeCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Exames</CardTitle>
          <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{recentExams.length}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            {completedExams.length} concluídos
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Gasto Total</CardTitle>
          <DollarSign className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">R$ {totalCost.toFixed(2)}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            Últimos 30 dias
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Custo Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">R$ {averageCost.toFixed(2)}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            Por exame
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Mais Comum</CardTitle>
          <Activity className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{mostCommonExam}</div>
          <p className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
            {examTypeCounts[mostCommonExam] || 0} realizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsStats;
