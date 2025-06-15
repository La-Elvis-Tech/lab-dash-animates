
import { supabase } from '@/integrations/supabase/client';
import { SupabaseAppointment } from '@/types/appointment';

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

export const appointmentService = {
  async calculateExamMaterials(examTypeId: string): Promise<MaterialValidation> {
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
  },

  async createAppointment(appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Validar materiais primeiro
    const materialValidation = await this.calculateExamMaterials(appointment.exam_type_id);
    
    if (!materialValidation.canSchedule) {
      throw new Error(`Estoque insuficiente: ${materialValidation.insufficientMaterials.join(', ')}`);
    }

    const appointmentData = {
      ...appointment,
      created_by: userData.user.id,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAppointment(id: string, updates: Partial<SupabaseAppointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
