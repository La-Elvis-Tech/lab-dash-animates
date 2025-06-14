
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseAppointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  exam_type_id: string;
  doctor_id: string;
  unit_id: string;
  scheduled_date: string;
  duration_minutes: number;
  status: 'Agendado' | 'Confirmado' | 'Em andamento' | 'Concluído' | 'Cancelado';
  cost?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  exam_types?: {
    name: string;
    category: string;
    duration_minutes: number;
    cost?: number;
  };
  doctors?: {
    name: string;
    specialty: string;
    crm: string;
  };
  units?: {
    name: string;
    code: string;
  };
}

export interface ExamType {
  id: string;
  name: string;
  category: string;
  description?: string;
  duration_minutes: number;
  cost?: number;
  requires_preparation: boolean;
  preparation_instructions?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  email?: string;
  phone?: string;
  unit_id?: string;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export const useSupabaseAppointments = () => {
  const [appointments, setAppointments] = useState<SupabaseAppointment[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          exam_types(name, category, duration_minutes, cost),
          doctors(name, specialty, crm),
          units(name, code)
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    }
  };

  const fetchExamTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setExamTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching exam types:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setUnits(data || []);
    } catch (error: any) {
      console.error('Error fetching units:', error);
    }
  };

  const createAppointment = async (appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const appointmentData = {
        ...appointment,
        created_by: userData.user.id,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      
      toast({
        title: 'Agendamento criado',
        description: `Agendamento para ${appointment.patient_name} foi criado com sucesso.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<SupabaseAppointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      
      toast({
        title: 'Agendamento atualizado',
        description: 'As informações foram salvas com sucesso.',
      });

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
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAppointments(),
        fetchExamTypes(),
        fetchDoctors(),
        fetchUnits()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    appointments,
    examTypes,
    doctors,
    units,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments: fetchAppointments,
    refreshExamTypes: fetchExamTypes,
    refreshDoctors: fetchDoctors,
    refreshUnits: fetchUnits,
  };
};
