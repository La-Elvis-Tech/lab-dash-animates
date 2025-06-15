
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import AvailableTimesGrid from './AvailableTimesGrid';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useDoctors } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';
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
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [recommendedSlot, setRecommendedSlot] = useState<any>(null);
  
  const { getAvailableSlots, findNextAvailableSlot, loading } = useAvailableSlots();
  const { doctors } = useDoctors();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate && doctors.length > 0) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor, doctors]);

  useEffect(() => {
    // Buscar horário recomendado quando os médicos carregarem
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
      
      // Se a data recomendada for hoje ou em breve, mostrar no calendário
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
      case 'Agendado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Confirmado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Em andamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Concluído': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300';
    }
  };

  const EventComponent = ({ event }: { event: any }) => {
    const appointment = event.resource as SupabaseAppointment;
    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{appointment.patient_name}</div>
        <div className="text-neutral-600 dark:text-neutral-400 truncate">
          {appointment.exam_types?.name}
        </div>
        <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
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
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    };
  };

  const handleSelectTime = (time: string, doctorId?: string) => {
    if (!selectedDate) return;
    
    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000)); // 30 minutes default
    
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
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Próximo horário disponível
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {format(recommendedSlot.date, 'dd/MM/yyyy')} às {recommendedSlot.time} com {recommendedSlot.doctorName}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRecommendedSlotClick}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Agendar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-neutral-900 dark:text-neutral-100">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Calendário de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }} className="rounded-lg overflow-hidden">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={setView}
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
              className="bg-white dark:bg-neutral-800 rounded-lg"
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
