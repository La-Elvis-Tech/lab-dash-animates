
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download size={20} />
          Exportação e Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato de Exportação</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dados para Exportar</label>
            <div className="space-y-2">
              {dataOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedData.includes(option.id)}
                    onCheckedChange={(checked) => handleDataSelection(option.id, !!checked)}
                  />
                  <label htmlFor={option.id} className="text-sm">{option.label}</label>
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
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="auto-report"
                checked={autoReport}
                onCheckedChange={setAutoReport}
              />
              <label htmlFor="auto-report" className="text-sm font-medium">
                Relatórios Automáticos
              </label>
            </div>
            {autoReport && (
              <div className="ml-6 space-y-2">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-sm text-gray-600">
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
