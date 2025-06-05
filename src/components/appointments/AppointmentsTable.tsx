
import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AppointmentsTableProps {
  appointments: Appointment[];
  getStatusColor: (status: string) => string;
  onUpdateStatus?: (appointmentId: string, newStatus: string) => void;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ 
  appointments, 
  getStatusColor, 
  onUpdateStatus 
}) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState<string | null>(null);

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(appointmentId, newStatus);
    }
    setSelectedAppointment(null);
  };

  const canChangeStatus = (status: string) => {
    return status === 'Agendado' || status === 'Confirmado';
  };

  return (
    <div className="w-full">
      <ScrollArea className="h-[400px] w-full">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead className="min-w-[120px]">Paciente</TableHead>
                <TableHead className="min-w-[120px]">Tipo</TableHead>
                <TableHead className="w-[90px]">Data</TableHead>
                <TableHead className="w-[80px]">Horário</TableHead>
                <TableHead className="min-w-[120px]">Médico</TableHead>
                <TableHead className="min-w-[120px]">Unidade</TableHead>
                <TableHead className="w-[80px]">Custo (R$)</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-xs">{appointment.id}</TableCell>
                    <TableCell className="text-sm">{appointment.patient}</TableCell>
                    <TableCell className="text-sm">{appointment.type}</TableCell>
                    <TableCell className="text-sm">{format(appointment.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        {format(appointment.date, "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{appointment.doctor}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        {appointment.unit}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {appointment.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)} variant="secondary">
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {canChangeStatus(appointment.status) && (
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedAppointment(appointment.id)}
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirmar Conclusão</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja marcar este agendamento como concluído?
                                  <br />
                                  <strong>Paciente:</strong> {appointment.patient}
                                  <br />
                                  <strong>Tipo:</strong> {appointment.type}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedAppointment(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => handleStatusUpdate(appointment.id, 'Concluído')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirmar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedAppointment(appointment.id)}
                              >
                                <XCircle className="h-3 w-3 text-red-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirmar Cancelamento</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja cancelar este agendamento?
                                  <br />
                                  <strong>Paciente:</strong> {appointment.patient}
                                  <br />
                                  <strong>Tipo:</strong> {appointment.type}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedAppointment(null)}
                                >
                                  Voltar
                                </Button>
                                <Button
                                  onClick={() => handleStatusUpdate(appointment.id, 'Cancelado')}
                                  variant="destructive"
                                >
                                  Cancelar Agendamento
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-gray-500 dark:text-gray-400">
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
