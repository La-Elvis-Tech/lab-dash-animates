
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
  doctorName?: string;
  doctorId?: string;
}

interface AvailableTimesGridProps {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  onSelectTime: (time: string, doctorId?: string) => void;
  selectedDoctor?: string;
  doctors: Array<{ id: string; name: string; specialty: string }>;
  onDoctorChange: (doctorId: string) => void;
  recommendedSlot?: { time: string; doctorId: string; doctorName: string };
}

const AvailableTimesGrid: React.FC<AvailableTimesGridProps> = ({
  selectedDate,
  timeSlots,
  onSelectTime,
  selectedDoctor,
  doctors,
  onDoctorChange,
  recommendedSlot,
}) => {
  const morningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 9 && hour < 12;
  });

  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 19;
  });

  const renderTimeGrid = (slots: TimeSlot[], title: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isRecommended = recommendedSlot && 
            slot.time === recommendedSlot.time && 
            slot.doctorId === recommendedSlot.doctorId;
          
          return (
            <Button
              key={`${slot.time}-${slot.doctorId}`}
              variant={slot.available ? (isRecommended ? "default" : "outline") : "ghost"}
              size="sm"
              disabled={!slot.available}
              onClick={() => onSelectTime(slot.time, slot.doctorId)}
              className={`relative h-16 flex flex-col ${
                slot.available 
                  ? isRecommended 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md ring-2 ring-green-300' 
                    : 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-neutral-800'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{slot.time}</div>
                {slot.doctorName && (
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-full">
                    {slot.doctorName}
                  </div>
                )}
              </div>
              {isRecommended && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
                  Recomendado
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Horários Disponíveis - {format(selectedDate, 'dd \'de\' MMMM', { locale: ptBR })}
        </CardTitle>
        
        {/* Doctor Filter */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant={!selectedDoctor ? "default" : "outline"}
            size="sm"
            onClick={() => onDoctorChange('')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Todos os Médicos
          </Button>
          {doctors.map((doctor) => (
            <Button
              key={doctor.id}
              variant={selectedDoctor === doctor.id ? "default" : "outline"}
              size="sm"
              onClick={() => onDoctorChange(doctor.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <User className="h-3 w-3 mr-1" />
              {doctor.name}
            </Button>
          ))}
        </div>

        {/* Recommended Slot Alert */}
        {recommendedSlot && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Horário Recomendado:</span>
              <span>{recommendedSlot.time} com {recommendedSlot.doctorName}</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {morningSlots.length > 0 && renderTimeGrid(morningSlots, "Manhã (9:00 - 12:00)")}
        {afternoonSlots.length > 0 && renderTimeGrid(afternoonSlots, "Tarde (12:00 - 19:00)")}
        
        {timeSlots.length === 0 && (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum horário disponível para esta data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableTimesGrid;
