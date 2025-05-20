import React, { useState } from 'react';
import { addDays, format, isAfter, isBefore, isSameDay, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, MapPin, Building } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data for appointments
const mockAppointments = [
  { 
    id: 'A001',
    patient: 'João Silva',
    type: 'Coleta de Sangue',
    date: new Date(2024, 4, 15, 9, 30), 
    doctor: 'Dra. Ana Souza',
    unit: 'Unidade Centro',
    cost: 120.00,
    status: 'Concluído'
  },
  { 
    id: 'A002',
    patient: 'Maria Santos',
    type: 'Entrega de Resultado',
    date: new Date(2024, 4, 16, 10, 45), 
    doctor: 'Dr. Carlos Mendes',
    unit: 'Unidade Norte',
    cost: 0,
    status: 'Cancelado'
  },
  { 
    id: 'A003',
    patient: 'Pedro Oliveira',
    type: 'Colonoscopia',
    date: new Date(2024, 4, 22, 8, 0), 
    doctor: 'Dra. Lucia Freitas',
    unit: 'Unidade Sul',
    cost: 550.00,
    status: 'Confirmado'
  },
  { 
    id: 'A004',
    patient: 'Ana Pereira',
    type: 'Ultrassom',
    date: new Date(2024, 4, 23, 14, 15), 
    doctor: 'Dr. Roberto Castro',
    unit: 'Unidade Leste',
    cost: 280.00,
    status: 'Confirmado'
  },
  { 
    id: 'A005',
    patient: 'Carlos Ribeiro',
    type: 'Raio-X',
    date: new Date(2024, 4, 24, 11, 0), 
    doctor: 'Dra. Fernanda Lima',
    unit: 'Unidade Centro',
    cost: 180.00,
    status: 'Confirmado'
  },
  { 
    id: 'A006',
    patient: 'Luiza Martins',
    type: 'Eletrocardiograma',
    date: new Date(2024, 4, 25, 15, 30), 
    doctor: 'Dr. Paulo Vieira',
    unit: 'Unidade Norte',
    cost: 220.00,
    status: 'Agendado'
  },
  { 
    id: 'A007',
    patient: 'Paulo Costa',
    type: 'Coleta de Sangue',
    date: new Date(2024, 4, 19, 9, 0), 
    doctor: 'Dra. Ana Souza',
    unit: 'Unidade Sul',
    cost: 120.00,
    status: 'Agendado'
  },
  { 
    id: 'A008',
    patient: 'Mariana Lima',
    type: 'Densitometria',
    date: new Date(2024, 4, 20, 13, 45), 
    doctor: 'Dr. José Santos',
    unit: 'Unidade Leste',
    cost: 320.00,
    status: 'Agendado'
  },
  { 
    id: 'A009',
    patient: 'Ricardo Alves',
    type: 'Tomografia',
    date: new Date(2024, 4, 28, 10, 30), 
    doctor: 'Dra. Carla Mendes',
    unit: 'Unidade Centro',
    cost: 850.00,
    status: 'Agendado'
  },
  { 
    id: 'A010',
    patient: 'Camila Ferreira',
    type: 'Mamografia',
    date: new Date(2024, 4, 30, 11, 15), 
    doctor: 'Dr. André Oliveira',
    unit: 'Unidade Norte',
    cost: 380.00,
    status: 'Agendado'
  },
];

const Orders: React.FC = () => {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Filter appointments by date range
  const filterAppointmentsByPeriod = (startDate: Date, endDate?: Date) => {
    return appointments.filter(app => {
      const appDate = startOfDay(new Date(app.date));
      if (endDate) {
        return (isAfter(appDate, startDate) || isSameDay(appDate, startDate)) && 
               (isBefore(appDate, endDate) || isSameDay(appDate, endDate));
      }
      return isSameDay(appDate, startDate);
    });
  };

  // Get recent appointments (before today)
  const recentAppointments = appointments.filter(app => {
    return isBefore(new Date(app.date), today);
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // Get next 7 days appointments
  const sevenDaysFromNow = addDays(today, 7);
  const next7DaysAppointments = filterAppointmentsByPeriod(today, sevenDaysFromNow);

  // Get rest of the month appointments
  const endOfCurrentMonth = endOfMonth(today);
  const restOfMonthAppointments = appointments.filter(app => {
    const appDate = startOfDay(new Date(app.date));
    return isAfter(appDate, sevenDaysFromNow) && 
           (isBefore(appDate, endOfCurrentMonth) || isSameDay(appDate, endOfCurrentMonth));
  });

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate 
    ? appointments.filter(app => isSameDay(new Date(app.date), selectedDate))
    : [];

  // Calendar dates with appointments
  const appointmentDates = appointments.map(app => app.date);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Concluído': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'Confirmado': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    }
  };

  // Get appointments by unit
  const unitAppointments = appointments.reduce((acc, app) => {
    const unit = app.unit;
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(app);
    return acc;
  }, {} as Record<string, typeof mockAppointments>);

  // Units list with appointment counts
  const unitsList = Object.keys(unitAppointments).map(unit => ({
    name: unit,
    count: unitAppointments[unit].length,
    appointments: unitAppointments[unit]
  }));

  // Render appointments table
  const renderAppointmentsTable = (appointmentsList: typeof mockAppointments) => (
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
            {appointmentsList.length > 0 ? (
              appointmentsList.map((appointment) => (
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

  // Render units table
  const renderUnitsTable = () => (
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
            {unitsList.map((unit) => (
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">Agendamentos</h1>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendário
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setIsCalendarOpen(false);
              }}
              modifiers={{
                hasAppointment: appointmentDates,
              }}
              modifiersStyles={{
                hasAppointment: {
                  color: 'red',
                  fontWeight: 'bold',
                }
              }}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Card className="dark:bg-gray-800 dark:text-gray-100 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">Agendamentos Gerais</CardTitle>
            <CardDescription>
              Visualize seus agendamentos recentes e futuros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="next7days">
              <TabsList className="mb-4 bg-gradient-to-r from-gray-100 to-white dark:from-gray-700 dark:to-gray-800">
                <TabsTrigger value="recent">Recentes</TabsTrigger>
                <TabsTrigger value="next7days">Próximos 7 dias</TabsTrigger>
                <TabsTrigger value="restOfMonth">Resto do mês</TabsTrigger>
                <TabsTrigger value="units">
                  <Building className="h-4 w-4 mr-1" />
                  Unidades
                </TabsTrigger>
                {selectedDate && (
                  <TabsTrigger value="selectedDate">
                    {format(selectedDate, "dd/MM/yyyy")}
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="recent" className="mt-0">
                <h3 className="text-lg font-medium mb-4">Agendamentos recentes</h3>
                {renderAppointmentsTable(recentAppointments)}
              </TabsContent>
              
              <TabsContent value="next7days" className="mt-0">
                <h3 className="text-lg font-medium mb-4">
                  Próximos 7 dias ({format(today, "dd/MM")} - {format(sevenDaysFromNow, "dd/MM")})
                </h3>
                {renderAppointmentsTable(next7DaysAppointments)}
              </TabsContent>
              
              <TabsContent value="restOfMonth" className="mt-0">
                <h3 className="text-lg font-medium mb-4">
                  Resto do mês ({format(addDays(sevenDaysFromNow, 1), "dd/MM")} - {format(endOfCurrentMonth, "dd/MM")})
                </h3>
                {renderAppointmentsTable(restOfMonthAppointments)}
              </TabsContent>

              <TabsContent value="units" className="mt-0">
                <h3 className="text-lg font-medium mb-4">
                  Unidades e seus agendamentos
                </h3>
                {renderUnitsTable()}
              </TabsContent>
              
              {selectedDate && (
                <TabsContent value="selectedDate" className="mt-0">
                  <h3 className="text-lg font-medium mb-4">
                    Agendamentos em {format(selectedDate, "dd/MM/yyyy")}
                  </h3>
                  {renderAppointmentsTable(selectedDateAppointments)}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
