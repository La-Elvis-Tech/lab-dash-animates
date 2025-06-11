
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

interface InventoryExportDialogProps {
  items: any[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const InventoryExportDialog: React.FC<InventoryExportDialogProps> = ({
  items,
  isOpen,
  setIsOpen,
}) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const { toast } = useToast();

  const exportToCSV = (data: any[]) => {
    const headers = [
      "Nome",
      "Categoria", 
      "Quantidade",
      "Unidade",
      "Localização",
      "Tamanho",
      "Validade",
      "Último Uso",
      "Status",
      "Estoque Mínimo",
      "Estoque Máximo",
      "Reservadas"
    ];

    const csvContent = [
      headers.join(","),
      ...data.map(item => [
        `"${item.name}"`,
        `"${item.category}"`,
        item.stock,
        `"${item.unit}"`,
        `"${item.location}"`,
        `"${item.size || ''}"`,
        `"${item.expiryDate || ''}"`,
        `"${item.lastUsed}"`,
        `"${item.status}"`,
        item.minStock || 0,
        item.maxStock || 0,
        item.reservedForAppointments || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    if (exportFormat === "csv") {
      exportToCSV(items);
    } else if (exportFormat === "json") {
      exportToJSON(items);
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
                <SelectItem value="csv">CSV (Excel compatível)</SelectItem>
                <SelectItem value="json">JSON (Dados estruturados)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>CSV:</strong> Ideal para análise em Excel ou Google Sheets</p>
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
