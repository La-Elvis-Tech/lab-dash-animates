
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';

interface ExportControlsProps {
  data: any[];
  reportType: string;
  onExport?: (format: string, dataTypes: string[]) => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({ data, reportType, onExport }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const { toast } = useToast();

  const handleExport = () => {
    try {
      // If onExport prop is provided, use it (for custom export logic)
      if (onExport) {
        onExport(format, []);
        return;
      }

      // Default export logic
      const filename = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(data, filename);
      } else {
        exportToJSON(data, filename);
      }

      toast({
        title: 'Relatório exportado',
        description: `Dados exportados em formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Formato:</span>
        <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                CSV
              </div>
            </SelectItem>
            <SelectItem value="json">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                JSON
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={handleExport} disabled={!data || data.length === 0}>
        <Download className="w-4 h-4 mr-2" />
        Exportar Relatório
      </Button>
    </div>
  );
};

export default ExportControls;
