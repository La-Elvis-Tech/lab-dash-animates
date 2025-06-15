
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Calendar as CalendarIcon, Sparkles, Moon, Sun } from 'lucide-react';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import AvailableTimesGrid from './AvailableTimesGrid';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useDoctors } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'pt-BR': ptBR },
});

interface AppointmentCalendarProps {
  appointments: SupabaseAppointment[];
  onSelectAppointment?: (appointment: SupabaseAppointment) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; time?: string; doctorId?: string }) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectAppointment,
  onSelectSlot,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [recommendedSlot, setRecommendedSlot] = useState<any>(null);
  
  const { getAvailableSlots, findNextAvailableSlot, loading } = useAvailableSlots();
  const { doctors } = useDoctors();
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (selectedDate && doctors.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor, doctors]);

  useEffect(() => {
    if (doctors.length > 0) {
      findRecommendedSlot();
    }
  }, [doctors]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || doctors.length === 0) return;
    
    const slots = await getAvailableSlots(selectedDate, doctors, selectedDoctor);
    setTimeSlots(slots);
  };

  const findRecommendedSlot = async () => {
    if (doctors.length === 0) return;
    
    const recommended = await findNextAvailableSlot(doctors);
    if (recommended) {
      setRecommendedSlot(recommended);
      
      if (isSameDay(recommended.date, new Date()) || 
          Math.abs(recommended.date.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000) {
        setSelectedDate(recommended.date);
      }
    }
  };

  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.patient_name} - ${appointment.exam_types?.name || 'Exame'}`,
    start: new Date(appointment.scheduled_date),
    end: new Date(new Date(appointment.scheduled_date).getTime() + (appointment.duration_minutes * 60000)),
    resource: appointment,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Confirmado': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Em andamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Concluído': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const EventComponent = ({ event }: { event: any }) => {
    const appointment = event.resource as SupabaseAppointment;
    return (
      <div className="p-2 text-xs">
        <div className="font-semibold truncate text-white">{appointment.patient_name}</div>
        <div className="text-gray-200 truncate">
          {appointment.exam_types?.name}
        </div>
        <Badge className={`${getStatusColor(appointment.status)} text-xs mt-1`}>
          {appointment.status}
        </Badge>
      </div>
    );
  };

  const eventStyleGetter = (event: any) => {
    const appointment = event.resource as SupabaseAppointment;
    let backgroundColor = '#3b82f6';
    
    switch (appointment.status) {
      case 'Confirmado': backgroundColor = '#16a34a'; break;
      case 'Em andamento': backgroundColor = '#eab308'; break;
      case 'Concluído': backgroundColor = '#6b7280'; break;
      case 'Cancelado': backgroundColor = '#dc2626'; break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        boxShadow: theme === 'dark' 
          ? '0 4px 6px rgba(0,0,0,0.3)' 
          : '0 2px 4px rgba(0,0,0,0.1)'
      }
    };
  };

  const handleSelectTime = (time: string, doctorId?: string) => {
    if (!selectedDate) return;
    
    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000));
    
    onSelectSlot?.({
      start: startTime,
      end: endTime,
      time,
      doctorId
    });

    toast({
      title: 'Horário selecionado',
      description: `${time} ${doctorId ? `com ${doctors.find(d => d.id === doctorId)?.name}` : ''}`,
    });
  };

  const handleRecommendedSlotClick = () => {
    if (recommendedSlot) {
      setSelectedDate(recommendedSlot.date);
      setCurrentDate(recommendedSlot.date);
      handleSelectTime(recommendedSlot.time, recommendedSlot.doctorId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommended Slot Banner */}
      {recommendedSlot && (
        <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200 text-lg">
                    Próximo horário disponível
                  </p>
                  <p className="text-green-600 dark:text-green-300">
                    {format(recommendedSlot.date, 'dd/MM/yyyy')} às {recommendedSlot.time} com Dr. {recommendedSlot.doctorName}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRecommendedSlotClick}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                size="lg"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Agendar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <CardTitle className="flex items-center justify-between text-2xl text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              Calendário de Agendamentos
            </div>
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div 
            style={{ height: '600px' }} 
            className={`rounded-xl overflow-hidden ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={(event) => onSelectAppointment?.(event.resource)}
              onSelectSlot={(slotInfo) => {
                setSelectedDate(slotInfo.start);
                onSelectSlot?.(slotInfo);
              }}
              selectable={!!onSelectSlot}
              popup={true}
              components={{
                event: EventComponent,
              }}
              eventPropGetter={eventStyleGetter}
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Não há agendamentos neste período',
                showMore: (total) => `+ Ver mais (${total})`,
              }}
              className={`${
                theme === 'dark' 
                  ? 'rbc-calendar-dark' 
                  : 'rbc-calendar-light'
              } rounded-lg`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Times Grid */}
      {selectedDate && doctors.length > 0 && (
        <AvailableTimesGrid
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          onSelectTime={handleSelectTime}
          selectedDoctor={selectedDoctor}
          doctors={doctors}
          onDoctorChange={setSelectedDoctor}
          recommendedSlot={recommendedSlot && isSameDay(recommendedSlot.date, selectedDate) ? recommendedSlot : undefined}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
