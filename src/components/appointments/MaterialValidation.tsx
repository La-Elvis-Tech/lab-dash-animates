
import React from 'react';
import { AlertTriangle, CheckCircle, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MaterialValidation as MaterialValidationType } from '@/hooks/useSupabaseAppointments';

interface MaterialValidationProps {
  validation: MaterialValidationType | null;
  loading: boolean;
}

const MaterialValidation: React.FC<MaterialValidationProps> = ({ validation, loading }) => {
  if (loading) {
    return (
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-300">
              Verificando materiais necessários...
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Validação de Materiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status de validação */}
        <Alert className={validation.canSchedule ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
          <div className="flex items-center gap-2">
            {validation.canSchedule ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={validation.canSchedule ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {validation.canSchedule 
                ? 'Todos os materiais estão disponíveis para o agendamento.'
                : 'Alguns materiais não estão disponíveis em quantidade suficiente.'
              }
            </AlertDescription>
          </div>
        </Alert>

        {/* Materiais insuficientes */}
        {validation.insufficientMaterials.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 dark:text-red-300">Materiais Insuficientes:</h4>
            <ul className="space-y-1">
              {validation.insufficientMaterials.map((material, index) => (
                <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {material}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lista de materiais */}
        {validation.materials.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-neutral-700 dark:text-neutral-300">Materiais Necessários:</h4>
            <div className="grid gap-2">
              {validation.materials.map((material) => (
                <div 
                  key={material.inventory_item_id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {material.item_name}
                      </span>
                      <Badge 
                        variant={material.sufficient_stock ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {material.sufficient_stock ? 'Disponível' : 'Insuficiente'}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      Necessário: {material.quantity_required} | Disponível: {material.available_stock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <DollarSign className="h-3 w-3" />
                      R$ {Number(material.estimated_cost).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custo total estimado */}
        {validation.totalEstimatedCost > 0 && (
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Custo Total Estimado dos Materiais:
              </span>
              <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                R$ {validation.totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialValidation;
