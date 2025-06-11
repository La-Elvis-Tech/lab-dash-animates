
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
import React, { useState, useEffect } from "react";

// Component imports
import AppointmentsCalendar from "@/components/appointments/AppointmentsCalendar";
import AppointmentsTabs from "@/components/appointments/AppointmentsTabs";

// Types and utilities
import {
  getStatusColor,
  getUnitsSummary
} from "@/utils/appointments";

// Data imports
import { 
  getAppointments, 
  updateAppointmentStatus,
  type Appointment 
} from "@/data/appointments";

const Orders: React.FC = () => {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load appointments on component mount
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
      }
    };

    loadAppointments();
  }, []);

  // Função para atualizar status do agendamento
  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Agendamentos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie seus agendamentos de forma eficiente
          </p>
        </div>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700 mt-4 xs:mt-2 md:mt-0"
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
        <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100">
              Agendamentos Gerais
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-300">
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
