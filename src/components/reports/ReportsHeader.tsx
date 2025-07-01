
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from 'lucide-react';

interface ReportsHeaderProps {
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  units: any[];
  showUnitSelector: boolean;
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  selectedUnit,
  onUnitChange,
  units,
  showUnitSelector
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Relatórios Avançados
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Análise detalhada com métricas de performance e dados em tempo real
        </p>
      </div>

      {showUnitSelector && units.length > 0 && (
        <Card className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Unidade:
                </span>
              </div>
              <Select value={selectedUnit} onValueChange={onUnitChange}>
                <SelectTrigger className="w-48 border-0 bg-white/60 dark:bg-neutral-800/40">
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                  <SelectItem value="default">Minha Unidade</SelectItem>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsHeader;
