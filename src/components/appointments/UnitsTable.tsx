
import React from 'react';
import { Building } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnitSummary } from '@/types/appointment';

interface UnitsTableProps {
  units: UnitSummary[];
}

const UnitsTable: React.FC<UnitsTableProps> = ({ units }) => {
  return (
    <div className="relative overflow-auto">
      <ScrollArea className="h-[400px] w-full">
        <div className="min-w-[600px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <TableRow>
                <TableHead className="whitespace-nowrap">Unidade</TableHead>
                <TableHead className="whitespace-nowrap text-right">Total Agendamentos</TableHead>
                <TableHead className="whitespace-nowrap text-right">Confirmados</TableHead>
                <TableHead className="whitespace-nowrap text-right">Agendados</TableHead>
                <TableHead className="whitespace-nowrap text-right">Concluídos</TableHead>
                <TableHead className="whitespace-nowrap text-right">Cancelados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length > 0 ? (
                units.map((unit, index) => (
                  <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="font-medium">{unit.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{unit.total}</TableCell>
                    <TableCell className="text-right">{unit.confirmed}</TableCell>
                    <TableCell className="text-right">{unit.scheduled}</TableCell>
                    <TableCell className="text-right">{unit.completed}</TableCell>
                    <TableCell className="text-right">{unit.canceled}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    Nenhuma unidade encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default UnitsTable;
