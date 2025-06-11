
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx"; // Adicione esta importação

// ... restante do código ...

const InventoryExportDialog: React.FC<InventoryExportDialogProps> = ({
  items,
  isOpen,
  setIsOpen,
}) => {
  const [exportFormat, setExportFormat] = useState("xlsx"); // Mude o padrão para XLSX
  const { toast } = useToast();

  // ... funções existentes ...

  // Adicione esta nova função
  const exportToXLSX = (data: any[]) => {
    const headers = [
      "Nome",
      "Categoria",
      "Unidade",
      "Localização",
      "Tamanho",
      "Validade",
      "Último Uso",
      "Status",
      "Quantidade",
      "Estoque Mínimo",
      "Estoque Máximo",
      "Reservadas"
    ];

    const worksheetData = [
      headers,
      ...data.map(item => [
        item.name,
        item.category,
        item.unit,
        item.location,
        item.size || '',
        item.expiryDate || '',
        item.lastUsed,
        item.status,
        item.stock,
        item.minStock || 0,
        item.maxStock || 0,
        item.reservedForAppointments || 0
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventário");

    // Gerar arquivo binário
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });

    // Criar link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (items.length === 0) {
      toast({
        title: "Nenhum item para exportar",
        description: "Não há itens disponíveis com os filtros aplicados.",
        variant: "destructive",
      });
      return;
    }

    switch (exportFormat) {
      case "csv":
        exportToCSV(items);
        break;
      case "json":
        exportToJSON(items);
        break;
      case "xlsx": // Novo caso
        exportToXLSX(items);
        break;
    }

    toast({
      title: "Exportação concluída",
      description: `${items.length} itens exportados em formato ${exportFormat.toUpperCase()}.`,
    });

    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={18} />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Inventário</DialogTitle>
          <DialogDescription>
            Exporte os dados do inventário atual ({items.length} itens) para análise externa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato de exportação</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">XLSX (Excel)</SelectItem> 
                <SelectItem value="csv">CSV (Excel compatível)</SelectItem>
                <SelectItem value="json">JSON (Dados estruturados)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>XLSX:</strong> Formato nativo do Excel (recomendado)</p> 
            <p><strong>CSV:</strong> Ideal para análise no Google Sheets</p>
            <p><strong>JSON:</strong> Formato estruturado para sistemas de terceiros</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleExport} className="w-full">
            <Download size={16} className="mr-2" />
            Exportar {items.length} itens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryExportDialog;
