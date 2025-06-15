
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, isAfter, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User,
  Sparkles 
} from 'lucide-react';
import { SupabaseAppointment } from '@/hooks/useSupabaseAppointments';
import AvailableTimesGrid from './AvailableTimesGrid';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useDoctors } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';

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
  const [currentWeek, setCurrentWeek] = useState(new Date());
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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-500 text-white';
      case 'Confirmado': return 'bg-green-500 text-white';
      case 'Em andamento': return 'bg-yellow-500 text-white';
      case 'Concluído': return 'bg-gray-500 text-white';
      case 'Cancelado': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.scheduled_date), date)
    );
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  return (
    <div className="space-y-4">
      {/* Recommended Slot Banner */}
      {recommendedSlot && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Próximo horário disponível
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    {format(recommendedSlot.date, 'dd/MM/yyyy')} às {recommendedSlot.time} com Dr. {recommendedSlot.doctorName}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setSelectedDate(recommendedSlot.date);
                  handleSelectTime(recommendedSlot.time, recommendedSlot.doctorId);
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                size="sm"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                Agendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View Calendar */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário Semanal
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium px-3">
                {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isPast = !isAfter(day, startOfToday()) && !isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    p-2 rounded-lg cursor-pointer transition-colors min-h-[80px] border
                    ${isSelected 
                      ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                    }
                    ${isPast ? 'opacity-50' : ''}
                    ${isToday(day) ? 'ring-2 ring-blue-400' : ''}
                  `}
                  onClick={() => !isPast && setSelectedDate(day)}
                >
                  <div className="text-center mb-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`text-xs p-1 rounded text-center cursor-pointer ${getStatusColor(appointment.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment?.(appointment);
                        }}
                      >
                        <div className="truncate font-medium">
                          {format(new Date(appointment.scheduled_date), 'HH:mm')}
                        </div>
                        <div className="truncate text-xs opacity-90">
                          {appointment.patient_name}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-center text-gray-500 font-medium">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
