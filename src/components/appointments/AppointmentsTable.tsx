
import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin } from 'lucide-react';
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
import { Appointment } from '@/types/appointment';

interface AppointmentsTableProps {
  appointments: Appointment[];
  getStatusColor: (status: string) => string;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, getStatusColor }) => {
  return (
    <div className="relative overflow-auto">
      <ScrollArea className="h-[400px] w-full">
        <div className="min-w-[800px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <TableRow>
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">Paciente</TableHead>
                <TableHead className="whitespace-nowrap">Tipo</TableHead>
                <TableHead className="whitespace-nowrap">Data</TableHead>
                <TableHead className="whitespace-nowrap">Horário</TableHead>
                <TableHead className="whitespace-nowrap">Médico</TableHead>
                <TableHead className="whitespace-nowrap">Unidade</TableHead>
                <TableHead className="whitespace-nowrap">Custo (R$)</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-none">
                    <TableCell className="font-medium">{appointment.id}</TableCell>
                    <TableCell>{appointment.patient}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>{format(appointment.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      {format(appointment.date, "HH:mm")}
                    </TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        {appointment.unit}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    Nenhum agendamento encontrado para este período.
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

export default AppointmentsTable;
