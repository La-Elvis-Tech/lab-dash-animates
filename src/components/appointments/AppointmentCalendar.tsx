import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
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
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectAppointment,
  onSelectSlot,
}) => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

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
      case 'Concluído': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const EventComponent = ({ event }: { event: any }) => {
    const appointment = event.resource as SupabaseAppointment;
    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{appointment.patient_name}</div>
        <div className="text-gray-600 dark:text-gray-400 truncate">
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
    let backgroundColor = '#3174ad';
    
    switch (appointment.status) {
      case 'Confirmado': backgroundColor = '#16a34a'; break;
      case 'Em andamento': backgroundColor = '#eab308'; break;
      case 'Concluído': backgroundColor = '#6b7280'; break;
      case 'Cancelado': backgroundColor = '#dc2626'; break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-neutral-900 dark:text-neutral-100">
            <CalendarIcon className="h-5 w-5 text-lab-blue" />
            Calendário de Agendamentos
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              className="bg-lab-blue hover:bg-lab-blue/90"
            >
              Mês
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              className="bg-lab-blue hover:bg-lab-blue/90"
            >
              Semana
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
              className="bg-lab-blue hover:bg-lab-blue/90"
            >
              Dia
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: '600px' }}>
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
            onSelectSlot={onSelectSlot}
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
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
