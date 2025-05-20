
import React from 'react';
import { Building } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnitSummary } from '@/types/appointment';

interface UnitsTableProps {
  units: UnitSummary[];
}

const UnitsTable: React.FC<UnitsTableProps> = ({ units }) => {
  return (
    <ScrollArea className="h-[400px] rounded-md">
      <div className="w-full overflow-auto" style={{ minWidth: '500px' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade</TableHead>
              <TableHead>Exames agendados</TableHead>
              <TableHead>Valor total (R$)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.name} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    {unit.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary text-primary-foreground">
                    {unit.count}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {unit.appointments.reduce((sum, app) => sum + app.cost, 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
};

export default UnitsTable;
