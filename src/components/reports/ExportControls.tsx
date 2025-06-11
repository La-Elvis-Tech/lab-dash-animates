
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportControlsProps {
  onExport: (format: string, data: string[]) => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({ onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [autoReport, setAutoReport] = useState(false);
  const { toast } = useToast();

  const dataOptions = [
    { id: "expenses", label: "Despesas por período" },
    { id: "inventory", label: "Dados de inventário" },
    { id: "forecasts", label: "Previsões e simulações" },
    { id: "performance", label: "Métricas de performance" },
    { id: "anomalies", label: "Anomalias detectadas" }
  ];

  const handleDataSelection = (dataId: string, checked: boolean) => {
    if (checked) {
      setSelectedData([...selectedData, dataId]);
    } else {
      setSelectedData(selectedData.filter(id => id !== dataId));
    }
  };

  const handleExport = () => {
    if (selectedData.length === 0) {
      toast({
        title: "Seleção necessária",
        description: "Selecione pelo menos um tipo de dados para exportar.",
        variant: "destructive"
      });
      return;
    }

    onExport(selectedFormat, selectedData);
    toast({
      title: "Exportação iniciada",
      description: `Dados sendo exportados em formato ${selectedFormat.toUpperCase()}.`,
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Relatório agendado",
      description: "Relatório automático configurado com sucesso.",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900/80 dark:to-neutral-950/80 border-neutral-300/60 border-opacity-80 dark:border-neutral-700 dark:border-opacity-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Download size={20} />
          Exportação e Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato de Exportação</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="bg-white dark:bg-neutral-800">
                <SelectValue placeholder="Selecionar formato" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-800">
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dados para Exportar</label>
            <div className="space-y-2">
              {dataOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedData.includes(option.id)}
                    onCheckedChange={(checked) => handleDataSelection(option.id, !!checked)}
                  />
                  <label htmlFor={option.id} className="text-sm text-gray-700 dark:text-gray-300">{option.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download size={16} />
              Exportar Agora
            </Button>
            <Button variant="outline" onClick={handleScheduleReport} className="flex items-center gap-2">
              <Calendar size={16} />
              Agendar Relatório
            </Button>
          </div>

          {/* Auto Report Settings */}
          <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="auto-report"
                checked={autoReport}
                onCheckedChange={(checked) => setAutoReport(!!checked)}
              />
              <label htmlFor="auto-report" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Relatórios Automáticos
              </label>
            </div>
            {autoReport && (
              <div className="ml-6 space-y-2">
                <Select>
                  <SelectTrigger className="w-full bg-white dark:bg-neutral-800">
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-800">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={14} />
                  <span>Enviado por email para stakeholders</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportControls;
