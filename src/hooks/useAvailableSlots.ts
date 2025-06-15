
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, isAfter, isBefore, startOfDay, getDay } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
  doctorName?: string;
  doctorId?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface DoctorSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const useAvailableSlots = () => {
  const [loading, setLoading] = useState(false);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Horários padrão temporários até os tipos serem atualizados
  const getDefaultDoctorSchedules = (doctorId: string): DoctorSchedule[] => {
    // Definir horários padrão baseados no ID do médico para simular diferentes horários
    const scheduleMap: Record<string, DoctorSchedule[]> = {
      // Dr. João Silva (Cardiologia) - Segunda a Sexta, 8:00-17:00
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': [
        { day_of_week: 1, start_time: '08:00', end_time: '17:00', is_available: true },
        { day_of_week: 2, start_time: '08:00', end_time: '17:00', is_available: true },
        { day_of_week: 3, start_time: '08:00', end_time: '17:00', is_available: true },
        { day_of_week: 4, start_time: '08:00', end_time: '17:00', is_available: true },
        { day_of_week: 5, start_time: '08:00', end_time: '17:00', is_available: true },
      ],
      // Dra. Maria Santos (Dermatologia) - Segunda a Sexta, 9:00-18:00
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': [
        { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_available: true },
        { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_available: true },
        { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_available: true },
        { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_available: true },
        { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_available: true },
      ],
    };

    // Se o médico não estiver no mapa, usar horário padrão
    return scheduleMap[doctorId] || [
      { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_available: true },
      { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_available: true },
      { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_available: true },
      { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_available: true },
      { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_available: true },
    ];
  };

  const isDoctorAvailableAtTime = (
    schedules: DoctorSchedule[], 
    targetDate: Date, 
    timeSlot: string
  ): boolean => {
    const dayOfWeek = getDay(targetDate); // 0=Sunday, 1=Monday, etc.
    const [hour, minute] = timeSlot.split(':').map(Number);
    const targetTime = hour * 60 + minute; // Convert to minutes

    // Find schedule for this day of week
    const daySchedule = schedules.find(s => s.day_of_week === dayOfWeek && s.is_available);
    
    if (!daySchedule) return false;

    // Convert schedule times to minutes
    const [startHour, startMinute] = daySchedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end_time.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return targetTime >= startTime && targetTime < endTime;
  };

  const getAvailableSlots = async (
    date: Date, 
    doctors: Doctor[], 
    selectedDoctorId?: string
  ): Promise<TimeSlot[]> => {
    setLoading(true);
    try {
      const targetDate = startOfDay(date);
      const nextDay = addDays(targetDate, 1);

      // Buscar agendamentos existentes para a data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          scheduled_date,
          duration_minutes,
          doctor_id,
          doctors(name)
        `)
        .gte('scheduled_date', targetDate.toISOString())
        .lt('scheduled_date', nextDay.toISOString())
        .neq('status', 'Cancelado');

      if (appointmentsError) throw appointmentsError;

      const timeSlots = generateTimeSlots();
      const availableSlots: TimeSlot[] = [];

      const filteredDoctors = selectedDoctorId 
        ? doctors.filter(d => d.id === selectedDoctorId)
        : doctors;

      for (const doctor of filteredDoctors) {
        const doctorSchedules = getDefaultDoctorSchedules(doctor.id);
        
        for (const timeSlot of timeSlots) {
          const [hour, minute] = timeSlot.split(':').map(Number);
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour, minute, 0, 0);

          // Verificar se o médico trabalha neste dia/horário
          const isDoctorWorking = isDoctorAvailableAtTime(doctorSchedules, date, timeSlot);
          
          if (!isDoctorWorking) continue;

          // Verificar se o horário já está ocupado
          const isOccupied = appointments?.some(apt => {
            if (apt.doctor_id !== doctor.id) return false;
            
            const aptDate = new Date(apt.scheduled_date);
            const aptEndTime = new Date(aptDate.getTime() + (apt.duration_minutes * 60000));
            
            return (
              (isAfter(slotDateTime, aptDate) || slotDateTime.getTime() === aptDate.getTime()) &&
              isBefore(slotDateTime, aptEndTime)
            );
          });

          availableSlots.push({
            time: timeSlot,
            available: !isOccupied,
            doctorName: doctor.name,
            doctorId: doctor.id,
          });
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const findNextAvailableSlot = async (
    doctors: Doctor[],
    startDate: Date = new Date()
  ): Promise<{ time: string; doctorId: string; doctorName: string; date: Date } | null> => {
    try {
      // Procurar nos próximos 30 dias
      for (let i = 0; i < 30; i++) {
        const searchDate = addDays(startOfDay(startDate), i);
        
        // Pular fins de semana (opcional)
        if (searchDate.getDay() === 0 || searchDate.getDay() === 6) continue;
        
        const slots = await getAvailableSlots(searchDate, doctors);
        const availableSlot = slots.find(slot => slot.available);
        
        if (availableSlot) {
          return {
            time: availableSlot.time,
            doctorId: availableSlot.doctorId!,
            doctorName: availableSlot.doctorName!,
            date: searchDate,
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding next available slot:', error);
      return null;
    }
  };

  return {
    getAvailableSlots,
    findNextAvailableSlot,
    loading,
  };
};
