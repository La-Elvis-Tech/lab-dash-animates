
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';

interface ExamMaterial {
  inventory_item_id: string;
  item_name: string;
  quantity_required: number;
  current_stock: number;
  available_stock: number;
  sufficient_stock: boolean;
  estimated_cost: number;
}

interface MaterialValidation {
  canSchedule: boolean;
  insufficientMaterials: string[];
  totalEstimatedCost: number;
  materials: ExamMaterial[];
}

interface MaterialValidationProps {
  validation: MaterialValidation | null;
  loading: boolean;
}

const MaterialValidation: React.FC<MaterialValidationProps> = ({ validation, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-neutral-900 dark:text-neutral-100">
            <Package className="h-5 w-5 text-blue-600" />
            Validando Materiais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">
              Verificando disponibilidade de materiais...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-neutral-900 dark:text-neutral-100">
          <Package className="h-5 w-5 text-blue-600" />
          Validação de Materiais
          {validation.canSchedule ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status geral */}
        <Alert className={validation.canSchedule ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={validation.canSchedule ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
            {validation.canSchedule 
              ? 'Todos os materiais estão disponíveis para o agendamento.'
              : `Materiais insuficientes: ${validation.insufficientMaterials.length} item(s)`
            }
          </AlertDescription>
        </Alert>

        {/* Lista de materiais */}
        {validation.materials.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Materiais Necessários:
            </h4>
            {validation.materials.map((material) => (
              <div
                key={material.inventory_item_id}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {material.item_name}
                    </span>
                    <Badge variant={material.sufficient_stock ? 'default' : 'destructive'}>
                      {material.sufficient_stock ? 'Disponível' : 'Insuficiente'}
                    </Badge>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Necessário: {material.quantity_required} | 
                    Disponível: {material.available_stock} | 
                    Estoque total: {material.current_stock}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    R$ {material.estimated_cost.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Custo total */}
            <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Custo Total Estimado:
              </span>
              <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                R$ {validation.totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Materiais insuficientes */}
        {validation.insufficientMaterials.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 dark:text-red-300">
              Materiais com Estoque Insuficiente:
            </h4>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              {validation.insufficientMaterials.map((material, index) => (
                <li key={index} className="flex items-center gap-2">
                  <XCircle className="h-3 w-3" />
                  {material}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialValidation;
