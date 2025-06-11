
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, Package, Database, Clock, Edit2, ShoppingCart, Link, 
  TrendingUp, AlertTriangle, CheckCircle, Save, X 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface InventoryItemCardProps {
  item: any;
  onUpdateItem: (itemId: number, updatedData: any) => void;
  onReserveItem: (itemId: number, quantity: number) => void;
  onRequestRestock: (itemId: number) => void;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onUpdateItem,
  onReserveItem,
  onRequestRestock,
}) => {
  const [isEditing, setIsEditing] = useState({ stock: false, expiryDate: false });
  const [editValues, setEditValues] = useState({ stock: item.stock, expiryDate: item.expiryDate });
  const [reserveQuantity, setReserveQuantity] = useState(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "ok":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStockLevel = () => {
    if (item.stock <= item.minStock) return "low";
    if (item.stock >= item.maxStock) return "high";
    return "normal";
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      case "high":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "border-l-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };

  const isExpiringSoon = () => {
    if (!item.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  const getDaysUntilExpiry = () => {
    if (!item.expiryDate) return null;
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const handleSaveEdit = (field: string) => {
    onUpdateItem(item.id, { [field]: editValues[field] });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleCancelEdit = (field: string) => {
    setEditValues({ ...editValues, [field]: item[field] });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const stockLevel = getStockLevel();
  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <Card className={`inventory-item overflow-hidden h-full transition-all duration-200 hover:shadow-lg border-l-4 ${getStockLevelColor(stockLevel)}`}>
      <div className="flex justify-between p-2">
        {isExpiringSoon() && (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <AlertTriangle size={12} />
            {daysUntilExpiry} dias
          </Badge>
        )}
        {item.reservedForAppointments > 0 && (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs flex items-center gap-1">
            <Link size={12} />
            {item.reservedForAppointments} reservadas
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="mr-2 flex-1">
            <h3 className="font-medium text-base sm:text-lg line-clamp-2 leading-tight">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {item.category}
              </span>
              {stockLevel === "low" && (
                <Badge variant="destructive" className="text-xs">
                  Baixo
                </Badge>
              )}
              {stockLevel === "high" && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  Excesso
                </Badge>
              )}
            </div>
          </div>
          
          {/* Edição inline do estoque */}
          <div className="flex items-center gap-2">
            {isEditing.stock ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={editValues.stock}
                  onChange={(e) => setEditValues({...editValues, stock: parseInt(e.target.value)})}
                  className="w-16 h-8 text-xs"
                />
                <Button size="sm" onClick={() => handleSaveEdit('stock')} className="h-6 w-6 p-0">
                  <Save size={12} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCancelEdit('stock')} className="h-6 w-6 p-0">
                  <X size={12} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)} whitespace-nowrap`}>
                  {item.stock} {item.unit}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditing({...isEditing, stock: true})}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 size={12} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso do estoque */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Min: {item.minStock}</span>
            <span>Max: {item.maxStock}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stockLevel === "low" ? "bg-red-500" : 
                stockLevel === "high" ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ 
                width: `${Math.min(100, (item.stock / item.maxStock) * 100)}%` 
              }}
            />
          </div>
        </div>

        <div className="mt-2 text-xs sm:text-sm space-y-2 flex-grow">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
              Localização:
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2 truncate">
              {item.location}
            </span>
          </div>

          {item.expiryDate && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                Validade:
              </span>
              {isEditing.expiryDate ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={editValues.expiryDate}
                    onChange={(e) => setEditValues({...editValues, expiryDate: e.target.value})}
                    className="h-6 text-xs"
                  />
                  <Button size="sm" onClick={() => handleSaveEdit('expiryDate')} className="h-6 w-6 p-0">
                    <Save size={10} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">
                    {new Date(item.expiryDate).toLocaleDateString("pt-BR")}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditing({...isEditing, expiryDate: true})}
                    className="h-4 w-4 p-0"
                  >
                    <Edit2 size={10} />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
              Último uso:
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">
              {new Date(item.lastUsed).toLocaleDateString("pt-BR")}
            </span>
          </div>

          {item.size && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                Tamanho:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-2">
                {item.size}
              </span>
            </div>
          )}
        </div>

        {/* Gráfico de consumo histórico */}
        {item.consumptionHistory && (
          <div className="mt-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-blue-500" />
              <span className="text-xs text-gray-500">Consumo (6 meses)</span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {item.consumptionHistory.map((value, index) => (
                <div
                  key={index}
                  className="bg-blue-500/70 rounded-t-sm flex-1 transition-all hover:bg-blue-600"
                  style={{ 
                    height: `${(value / Math.max(...item.consumptionHistory)) * 100}%`,
                    minHeight: '2px'
                  }}
                  title={`Mês ${index + 1}: ${value} ${item.unit}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-xs h-8 bg-blue-500 hover:bg-blue-600">
                <Link size={12} className="mr-1" />
                Reservar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Reservar para Agendamento</DialogTitle>
                <DialogDescription>
                  Reservar {item.name} para um agendamento específico
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={reserveQuantity}
                    onChange={(e) => setReserveQuantity(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => onReserveItem(item.id, reserveQuantity)}>
                  Confirmar Reserva
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={() => onRequestRestock(item.id)}
            className="text-xs h-8 bg-orange-500 hover:bg-orange-600"
          >
            <ShoppingCart size={12} className="mr-1" />
            Repor
          </Button>
        </div>

        {/* Popover com detalhes */}
        <div className="mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="w-full bg-neutral-200 hover:bg-blue-400 dark:bg-neutral-950/60 dark:hover:bg-blue-300 dark:hover:text-gray-800 text-gray-700 dark:text-white transition-colors text-xs sm:text-sm">
                Ver Detalhes
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 sm:w-80">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-base mb-1">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Análise detalhada do estoque
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Disponíveis:
                    </span>
                  </div>
                  <span className="font-medium">
                    {item.stock - item.reservedForAppointments} {item.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Reservadas:
                    </span>
                  </div>
                  <span className="font-medium">
                    {item.reservedForAppointments} {item.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Consumo médio mensal:
                    </span>
                  </div>
                  <span className="font-medium">
                    {Math.round(item.consumptionHistory?.reduce((a, b) => a + b, 0) / item.consumptionHistory?.length || 0)} {item.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Previsão para próximo mês:
                    </span>
                  </div>
                  <span className="font-medium">
                    {Math.round((item.consumptionHistory?.slice(-3).reduce((a, b) => a + b, 0) / 3) || 0)} {item.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Status estoque:
                    </span>
                  </div>
                  <Badge className={
                    stockLevel === "low" ? "bg-red-100 text-red-800" :
                    stockLevel === "high" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }>
                    {stockLevel === "low" ? "Baixo" : stockLevel === "high" ? "Excesso" : "Normal"}
                  </Badge>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryItemCard;
