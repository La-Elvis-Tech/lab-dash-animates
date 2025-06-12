
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

interface InventoryExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InventoryExportDialog: React.FC<InventoryExportDialogProps> = ({ open, onOpenChange }) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedData, setSelectedData] = useState<string[]>([]);

  const exportFormats = [
    { id: "csv", label: "CSV", description: "Arquivo separado por vírgulas" },
    { id: "excel", label: "Excel", description: "Planilha Excel (.xlsx)" },
    { id: "pdf", label: "PDF", description: "Documento PDF" },
    { id: "json", label: "JSON", description: "Dados estruturados" }
  ];

  const dataTypes = [
    { id: "inventory", label: "Inventário Completo", description: "Todos os itens do estoque" },
    { id: "low-stock", label: "Baixo Estoque", description: "Itens com estoque crítico" },
    { id: "expiring", label: "Próximo ao Vencimento", description: "Itens com vencimento em 30 dias" },
    { id: "movements", label: "Movimentações", description: "Histórico de entradas e saídas" }
  ];

  const exportToCSV = (data: any[]) => {
    console.log("Exporting to CSV:", data);
    // Implementation would go here
  };

  const exportToJSON = (data: any[]) => {
    console.log("Exporting to JSON:", data);
    // Implementation would go here
  };

  const handleFormatChange = (formatId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats([...selectedFormats, formatId]);
    } else {
      setSelectedFormats(selectedFormats.filter(id => id !== formatId));
    }
  };

  const handleDataChange = (dataId: string, checked: boolean) => {
    if (checked) {
      setSelectedData([...selectedData, dataId]);
    } else {
      setSelectedData(selectedData.filter(id => id !== dataId));
    }
  };

  const handleExport = () => {
    console.log("Exporting:", { formats: selectedFormats, data: selectedData });
    // Implementation would handle the actual export
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            Exportar Dados do Inventário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Formatos de Exportação</h3>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.map((format) => (
                  <div key={format.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={format.id}
                      checked={selectedFormats.includes(format.id)}
                      onCheckedChange={(checked) => handleFormatChange(format.id, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={format.id} className="font-medium">
                        {format.label}
                      </Label>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Tipos de Dados</h3>
              <div className="space-y-3">
                {dataTypes.map((dataType) => (
                  <div key={dataType.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={dataType.id}
                      checked={selectedData.includes(dataType.id)}
                      onCheckedChange={(checked) => handleDataChange(dataType.id, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={dataType.id} className="font-medium">
                        {dataType.label}
                      </Label>
                      <p className="text-xs text-gray-500">{dataType.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedFormats.length === 0 || selectedData.length === 0}
              className="gap-2"
            >
              <FileText size={16} />
              Exportar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryExportDialog;
