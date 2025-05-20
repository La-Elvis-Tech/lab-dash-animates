
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
    <ScrollArea className="h-[400px] rounded-md">
      <div className="w-full overflow-auto" style={{ minWidth: '800px' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Custo (R$)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <TableCell>{appointment.id}</TableCell>
                  <TableCell>{appointment.patient}</TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>{format(appointment.date, "dd/MM/yyyy")}</TableCell>
                  <TableCell className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(appointment.date, "HH:mm")}
                  </TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {appointment.unit}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {appointment.cost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
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
  );
};

export default AppointmentsTable;
