
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Edit, Trash, Calendar, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InventoryItem } from '@/data/inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  selectedItems: Set<string>;
  onSelectItem: (itemId: string) => void;
  onSelectAll: () => void;
  onUpdateItem: (itemId: string, updates: any) => Promise<void>;
  onReserveItem: (itemId: string, quantity: number) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateSuccess: () => void;
  onLowStockAlert: (item: InventoryItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onUpdateItem,
  onReserveItem,
  onDeleteItem,
  onUpdateSuccess,
  onLowStockAlert
}) => {
  const getStatusBadge = (item: InventoryItem) => {
    if (item.stock <= 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (item.stock <= item.minStock) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (item.stock <= item.minStock * 1.5) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Baixo</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Normal</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      await onDeleteItem(itemId);
      onUpdateSuccess();
    }
  };

  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200 dark:border-neutral-700">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.size === items.length && items.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Nome</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Categoria</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Estoque</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Unidade</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Status</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Fornecedor</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Localização</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Validade</TableHead>
              <TableHead className="text-neutral-900 dark:text-neutral-100">Preço</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id}
                className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => onSelectItem(item.id)}
                    aria-label={`Selecionar ${item.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-neutral-900 dark:text-neutral-100">
                  <div className="flex items-center gap-2">
                    {item.stock <= item.minStock && (
                      <AlertTriangle 
                        className="h-4 w-4 text-red-500" 
                        onClick={() => onLowStockAlert(item)}
                      />
                    )}
                    {item.name}
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  {item.category}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  <span className={item.stock <= item.minStock ? 'text-red-600 font-semibold' : ''}>
                    {item.stock}
                  </span>
                  <span className="text-neutral-400 text-sm ml-1">
                    / min: {item.minStock}
                  </span>
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  {item.unit}
                </TableCell>
                <TableCell>
                  {getStatusBadge(item)}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  {item.supplier}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  {item.location}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  {formatDate(item.expiryDate)}
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-300">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Reservar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default InventoryTable;
