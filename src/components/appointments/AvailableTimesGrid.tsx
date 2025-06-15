
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Sparkles } from 'lucide-react';
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
    return hour >= 8 && hour < 12;
  });

  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 18;
  });

  const renderTimeGrid = (slots: TimeSlot[], title: string) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-lg">
        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        {title}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
              className={`relative h-20 flex flex-col p-3 transition-all duration-200 ${
                slot.available 
                  ? isRecommended 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg ring-2 ring-green-300 dark:ring-green-500 transform scale-105' 
                    : 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-gray-700 dark:border-gray-600 shadow-sm hover:shadow-md'
                  : 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <div className="text-center space-y-1">
                <div className={`font-bold text-lg ${isRecommended ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                  {slot.time}
                </div>
                {slot.doctorName && (
                  <div className={`text-xs truncate max-w-full ${
                    isRecommended 
                      ? 'text-green-100' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Dr. {slot.doctorName.split(' ')[0]}
                  </div>
                )}
              </div>
              {isRecommended && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Recomendado
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      {slots.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum horário disponível neste período</p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <div>Horários Disponíveis</div>
            <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </CardTitle>
        
        {/* Doctor Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={!selectedDoctor ? "default" : "outline"}
            size="sm"
            onClick={() => onDoctorChange('')}
            className={`${
              !selectedDoctor 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Todos os Médicos
          </Button>
          {doctors.map((doctor) => (
            <Button
              key={doctor.id}
              variant={selectedDoctor === doctor.id ? "default" : "outline"}
              size="sm"
              onClick={() => onDoctorChange(doctor.id)}
              className={`${
                selectedDoctor === doctor.id 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <User className="h-3 w-3 mr-2" />
              Dr. {doctor.name.split(' ')[0]}
            </Button>
          ))}
        </div>

        {/* Recommended Slot Alert */}
        {recommendedSlot && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <span className="font-semibold">Horário Recomendado:</span>
                <div className="text-sm">
                  {recommendedSlot.time} com Dr. {recommendedSlot.doctorName}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-8 p-6">
        {morningSlots.length > 0 && renderTimeGrid(morningSlots, "Manhã (08:00 - 12:00)")}
        {afternoonSlots.length > 0 && renderTimeGrid(afternoonSlots, "Tarde (12:00 - 18:00)")}
        
        {timeSlots.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-10 w-10 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum horário disponível para esta data
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Selecione uma data diferente ou outro médico
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableTimesGrid;
