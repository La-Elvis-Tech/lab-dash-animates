
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { UnitSummary } from '@/types/appointment';

interface UnitsTableProps {
  units: UnitSummary[];
}

const UnitsTable: React.FC<UnitsTableProps> = ({ units }) => {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Unidade</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Confirmados</TableHead>
                <TableHead className="text-center">Agendados</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Cancelados</TableHead>
                <TableHead className="text-right">Taxa de Ocupação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => {
                // Count appointment statuses
                const total = unit.appointments.length;
                const confirmed = unit.appointments.filter(a => a.status === 'confirmed').length;
                const scheduled = unit.appointments.filter(a => a.status === 'scheduled').length;
                const completed = unit.appointments.filter(a => a.status === 'completed').length;
                const canceled = unit.appointments.filter(a => a.status === 'canceled').length;
                
                // Calculate occupancy rate - assume max capacity is 30 if not specified
                const maxCapacity = 30; // Default value
                const occupancyRate = Math.round((total / maxCapacity) * 100);
                
                return (
                  <TableRow key={unit.name}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="text-center">{total}</TableCell>
                    <TableCell className="text-center">{confirmed}</TableCell>
                    <TableCell className="text-center">{scheduled}</TableCell>
                    <TableCell className="text-center">{completed}</TableCell>
                    <TableCell className="text-center">{canceled}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          occupancyRate > 80
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                            : occupancyRate > 50
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                        }`}
                      >
                        {occupancyRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitsTable;
