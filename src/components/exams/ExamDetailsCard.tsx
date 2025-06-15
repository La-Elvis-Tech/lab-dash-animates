
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, FlaskConical, AlertTriangle, CheckCircle } from 'lucide-react';
import { ExamDetails } from '@/types/examDetails';

interface ExamDetailsCardProps {
  exam: ExamDetails;
  onSchedule?: () => void;
}

const ExamDetailsCard: React.FC<ExamDetailsCardProps> = ({ exam, onSchedule }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {exam.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">
              {exam.category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(exam.cost)}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              + {formatCurrency(exam.total_material_cost)} materiais
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {exam.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {exam.description}
          </p>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {exam.duration_minutes} minutos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-neutral-500" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {exam.materials.length} materiais
            </span>
          </div>
        </div>

        {exam.preparation.requires_preparation && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Requer Preparação
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {exam.preparation.preparation_instructions}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Materiais Necessários:
          </h4>
          <div className="space-y-1">
            {exam.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {material.item_name} ({material.quantity_required}x)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">
                    {formatCurrency(material.estimated_cost)}
                  </span>
                  {material.sufficient_stock ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            {exam.materials_available ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Materiais disponíveis
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Materiais insuficientes
                </span>
              </>
            )}
          </div>
          
          {onSchedule && (
            <Button 
              onClick={onSchedule}
              disabled={!exam.materials_available}
              size="sm"
              className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Agendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamDetailsCard;
