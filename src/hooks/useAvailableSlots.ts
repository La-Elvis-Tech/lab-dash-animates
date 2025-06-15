
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, isAfter, isBefore, startOfDay } from 'date-fns';

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
      const { data: appointments, error } = await supabase
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

      if (error) throw error;

      const timeSlots = generateTimeSlots();
      const availableSlots: TimeSlot[] = [];

      const filteredDoctors = selectedDoctorId 
        ? doctors.filter(d => d.id === selectedDoctorId)
        : doctors;

      for (const doctor of filteredDoctors) {
        for (const timeSlot of timeSlots) {
          const [hour, minute] = timeSlot.split(':').map(Number);
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour, minute, 0, 0);

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
