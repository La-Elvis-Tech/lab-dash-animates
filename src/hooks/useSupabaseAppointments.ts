
import { useAppointments } from './useAppointments';
import { useExamTypes } from './useExamTypes';
import { useDoctors } from './useDoctors';
import { useUnits } from './useUnits';
import { appointmentService } from '@/services/appointmentService';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseAppointments = () => {
  const { appointments, loading: appointmentsLoading, refreshAppointments } = useAppointments();
  const { examTypes, refreshExamTypes } = useExamTypes();
  const { doctors, refreshDoctors } = useDoctors();
  const { units, refreshUnits } = useUnits();
  const { toast } = useToast();

  const createAppointment = async (appointment: Parameters<typeof appointmentService.createAppointment>[0]) => {
    try {
      const data = await appointmentService.createAppointment(appointment);
      await refreshAppointments();
      
      toast({
        title: 'Agendamento criado',
        description: `Agendamento para ${appointment.patient_name} foi criado com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      
      if (error.message && error.message.includes('Estoque insuficiente')) {
        toast({
          title: 'Estoque insuficiente',
          description: error.message.replace('Estoque insuficiente: ', ''),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar o agendamento.',
          variant: 'destructive',
        });
      }
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Parameters<typeof appointmentService.updateAppointment>[1]) => {
    try {
      const data = await appointmentService.updateAppointment(id, updates);
      await refreshAppointments();
      
      if (updates.status === 'Cancelado') {
        toast({
          title: 'Agendamento cancelado',
          description: 'O agendamento foi cancelado e os materiais foram liberados.',
        });
      } else {
        toast({
          title: 'Agendamento atualizado',
          description: 'As informações foram salvas com sucesso.',
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      await refreshAppointments();
      
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o agendamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    appointments,
    examTypes,
    doctors,
    units,
    loading: appointmentsLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    calculateExamMaterials: appointmentService.calculateExamMaterials,
    refreshAppointments,
    refreshExamTypes,
    refreshDoctors,
    refreshUnits,
  };
};

// Re-export types for backward compatibility
export type { ExamType } from './useExamTypes';
export type { Doctor } from './useDoctors';
export type { Unit } from './useUnits';
export type { ExamMaterial, MaterialValidation } from '@/services/appointmentService';
export type { SupabaseAppointment } from '@/types/appointment';
