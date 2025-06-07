import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addDays,
  endOfMonth,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";

// Component imports
import AppointmentsCalendar from "@/components/appointments/AppointmentsCalendar";
import AppointmentsTabs from "@/components/appointments/AppointmentsTabs";

// Types and utilities
import {
  getStatusColor,
  getUnitsSummary
} from "@/utils/appointments";

// Mock data for appointments
const mockAppointments = [
  {
    id: "A001",
    patient: "João Silva",
    type: "Coleta de Sangue",
    date: new Date(2024, 4, 15, 9, 30),
    doctor: "Dra. Ana Souza",
    unit: "Unidade Centro",
    cost: 120.0,
    status: "Concluído",
  },
  {
    id: "A002",
    patient: "Maria Santos",
    type: "Entrega de Resultado",
    date: new Date(2024, 4, 16, 10, 45),
    doctor: "Dr. Carlos Mendes",
    unit: "Unidade Norte",
    cost: 0,
    status: "Cancelado",
  },
  {
    id: "A003",
    patient: "Pedro Oliveira",
    type: "Colonoscopia",
    date: new Date(2024, 4, 22, 8, 0),
    doctor: "Dra. Lucia Freitas",
    unit: "Unidade Sul",
    cost: 550.0,
    status: "Confirmado",
  },
  {
    id: "A004",
    patient: "Ana Pereira",
    type: "Ultrassom",
    date: new Date(2024, 4, 23, 14, 15),
    doctor: "Dr. Roberto Castro",
    unit: "Unidade Leste",
    cost: 280.0,
    status: "Confirmado",
  },
  {
    id: "A005",
    patient: "Carlos Ribeiro",
    type: "Raio-X",
    date: new Date(2024, 4, 24, 11, 0),
    doctor: "Dra. Fernanda Lima",
    unit: "Unidade Centro",
    cost: 180.0,
    status: "Confirmado",
  },
  {
    id: "A006",
    patient: "Luiza Martins",
    type: "Eletrocardiograma",
    date: new Date(2024, 4, 25, 15, 30),
    doctor: "Dr. Paulo Vieira",
    unit: "Unidade Norte",
    cost: 220.0,
    status: "Agendado",
  },
  {
    id: "A007",
    patient: "Paulo Costa",
    type: "Coleta de Sangue",
    date: new Date(2024, 4, 19, 9, 0),
    doctor: "Dra. Ana Souza",
    unit: "Unidade Sul",
    cost: 120.0,
    status: "Agendado",
  },
  {
    id: "A008",
    patient: "Mariana Lima",
    type: "Densitometria",
    date: new Date(2024, 4, 20, 13, 45),
    doctor: "Dr. José Santos",
    unit: "Unidade Leste",
    cost: 320.0,
    status: "Agendado",
  },
  {
    id: "A009",
    patient: "Ricardo Alves",
    type: "Tomografia",
    date: new Date(2024, 4, 28, 10, 30),
    doctor: "Dra. Carla Mendes",
    unit: "Unidade Centro",
    cost: 850.0,
    status: "Agendado",
  },
  {
    id: "A010",
    patient: "Camila Ferreira",
    type: "Mamografia",
    date: new Date(2024, 4, 30, 11, 15),
    doctor: "Dr. André Oliveira",
    unit: "Unidade Norte",
    cost: 380.0,
    status: "Agendado",
  },
];

const Orders: React.FC = () => {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Função para atualizar status do agendamento
  const handleUpdateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );
  };

  // Date calculations
  const sevenDaysFromNow = addDays(today, 6); // 7 dias incluindo hoje (hoje + 6)
  const endOfCurrentMonth = endOfMonth(today);

  // Get recent appointments (before today)
  const recentAppointments = appointments
    .filter((app) => {
      const appDate = startOfDay(new Date(app.date));
      return isBefore(appDate, today);
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Get next 7 days appointments - corrigido para incluir hoje até os próximos 6 dias
  const next7DaysAppointments = appointments.filter((app) => {
    const appDate = startOfDay(new Date(app.date));
    return (
      (isSameDay(appDate, today) || isAfter(appDate, today)) &&
      (isBefore(appDate, sevenDaysFromNow) ||
        isSameDay(appDate, sevenDaysFromNow))
    );
  });

  // Get rest of the month appointments - corrigido para pegar após 7 dias até fim do mês
  const restOfMonthAppointments = appointments.filter((app) => {
    const appDate = startOfDay(new Date(app.date));
    return (
      isAfter(appDate, sevenDaysFromNow) &&
      (isBefore(appDate, endOfCurrentMonth) ||
        isSameDay(appDate, endOfCurrentMonth))
    );
  });

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? appointments.filter((app) => isSameDay(new Date(app.date), selectedDate))
    : [];

  // Calendar dates with appointments
  const appointmentDates = appointments.map((app) => app.date);

  // Units summary
  const unitsList = getUnitsSummary(appointments);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Agendamentos
        </h1>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 dark:border-none mt-4 xs:mt-2 md:mt-0"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendário
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <AppointmentsCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setIsCalendarOpen={setIsCalendarOpen}
              appointmentDates={appointmentDates}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Card className="dark:bg-gray-800 dark:text-gray-100 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 dark:border-none">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
              Agendamentos Gerais
            </CardTitle>
            <CardDescription>
              Visualize seus agendamentos recentes e futuros
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto whitespace-nowrap grid ">
            <AppointmentsTabs
              recentAppointments={recentAppointments}
              next7DaysAppointments={next7DaysAppointments}
              restOfMonthAppointments={restOfMonthAppointments}
              selectedDate={selectedDate}
              selectedDateAppointments={selectedDateAppointments}
              unitsList={unitsList}
              today={today}
              sevenDaysFromNow={sevenDaysFromNow}
              endOfCurrentMonth={endOfCurrentMonth}
              getStatusColor={getStatusColor}
              onUpdateStatus={handleUpdateAppointmentStatus}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
