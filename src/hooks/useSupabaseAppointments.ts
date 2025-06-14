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

export interface ExamMaterial {
  inventory_item_id: string;
  item_name: string;
  quantity_required: number;
  current_stock: number;
  available_stock: number;
  sufficient_stock: boolean;
  estimated_cost: number;
}

export interface MaterialValidation {
  canSchedule: boolean;
  insufficientMaterials: string[];
  totalEstimatedCost: number;
  materials: ExamMaterial[];
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
      
      // Type-safe conversion
      const typedAppointments: SupabaseAppointment[] = (data || []).map(item => ({
        ...item,
        status: item.status as SupabaseAppointment['status']
      }));
      
      setAppointments(typedAppointments);
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

  const calculateExamMaterials = async (examTypeId: string): Promise<MaterialValidation> => {
    try {
      const { data, error } = await supabase.rpc('calculate_exam_materials', {
        p_exam_type_id: examTypeId
      });

      if (error) throw error;

      const materials: ExamMaterial[] = data || [];
      const insufficientMaterials = materials
        .filter(m => !m.sufficient_stock)
        .map(m => `${m.item_name} (necessário: ${m.quantity_required}, disponível: ${m.available_stock})`);
      
      const totalEstimatedCost = materials.reduce((sum, m) => sum + Number(m.estimated_cost || 0), 0);

      return {
        canSchedule: insufficientMaterials.length === 0,
        insufficientMaterials,
        totalEstimatedCost,
        materials
      };
    } catch (error: any) {
      console.error('Error calculating exam materials:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível calcular os materiais necessários.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createAppointment = async (appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Primeiro, calcular e validar materiais
      const materialValidation = await calculateExamMaterials(appointment.exam_type_id);
      
      if (!materialValidation.canSchedule) {
        toast({
          title: 'Estoque insuficiente',
          description: `Não é possível agendar devido a materiais insuficientes: ${materialValidation.insufficientMaterials.join(', ')}`,
          variant: 'destructive',
        });
        throw new Error('Estoque insuficiente');
      }

      const appointmentData = {
        ...appointment,
        created_by: userData.user.id,
      };

      // O trigger do banco irá automaticamente reservar os materiais
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      
      toast({
        title: 'Agendamento criado',
        description: `Agendamento para ${appointment.patient_name} foi criado com sucesso. Materiais reservados automaticamente.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      
      // Se o erro for de estoque insuficiente, mostrar mensagem específica
      if (error.message && error.message.includes('Estoque insuficiente')) {
        toast({
          title: 'Estoque insuficiente',
          description: error.message.replace('Estoque insuficiente para os seguintes materiais: ', ''),
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
      
      // Se cancelou o agendamento, informar sobre liberação de materiais
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
    calculateExamMaterials,
    refreshAppointments: fetchAppointments,
    refreshExamTypes: fetchExamTypes,
    refreshDoctors: fetchDoctors,
    refreshUnits: fetchUnits,
  };
};
