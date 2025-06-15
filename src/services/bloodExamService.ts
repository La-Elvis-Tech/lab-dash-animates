
import { supabase } from '@/integrations/supabase/client';
import { BloodVolumeCalculation, DetailedMaterialValidation } from '@/types/bloodExam';

export const bloodExamService = {
  async calculateBloodVolume(examIds: string[]): Promise<BloodVolumeCalculation | null> {
    try {
      const { data, error } = await supabase.rpc('calculate_blood_volume_needed', {
        p_exam_ids: examIds
      });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error calculating blood volume:', error);
      throw error;
    }
  },

  async validateMaterialsForExam(
    examTypeId: string, 
    bloodExamIds: string[] = []
  ): Promise<DetailedMaterialValidation[]> {
    try {
      const { data, error } = await supabase.rpc('calculate_detailed_exam_materials', {
        p_exam_type_id: examTypeId,
        p_blood_exams: bloodExamIds
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error validating materials:', error);
      throw error;
    }
  },

  async reserveMaterialsForAppointment(appointmentId: string, materials: DetailedMaterialValidation[]) {
    try {
      const reservations = materials.map(material => ({
        appointment_id: appointmentId,
        inventory_item_id: material.inventory_item_id,
        quantity_used: material.quantity_required,
        cost_per_unit: material.estimated_cost / material.quantity_required,
        total_cost: material.estimated_cost
      }));

      const { error } = await supabase
        .from('appointment_inventory')
        .insert(reservations);

      if (error) throw error;
    } catch (error) {
      console.error('Error reserving materials:', error);
      throw error;
    }
  },

  async releaseMaterialsForAppointment(appointmentId: string) {
    try {
      const { error } = await supabase
        .from('appointment_inventory')
        .delete()
        .eq('appointment_id', appointmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error releasing materials:', error);
      throw error;
    }
  },

  async updateInventoryAfterExam(appointmentId: string) {
    try {
      // Buscar materiais reservados
      const { data: reservedMaterials, error: fetchError } = await supabase
        .from('appointment_inventory')
        .select('*')
        .eq('appointment_id', appointmentId);

      if (fetchError) throw fetchError;

      // Atualizar estoque para cada material
      for (const material of reservedMaterials || []) {
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            current_stock: supabase.raw(`current_stock - ${material.quantity_used}`)
          })
          .eq('id', material.inventory_item_id);

        if (updateError) throw updateError;

        // Registrar movimento de saída
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            item_id: material.inventory_item_id,
            movement_type: 'out',
            quantity: material.quantity_used,
            unit_cost: material.cost_per_unit,
            total_cost: material.total_cost,
            reason: `Consumo em exame - Agendamento ${appointmentId}`,
            reference_type: 'appointment',
            reference_id: appointmentId,
            performed_by: (await supabase.auth.getUser()).data.user?.id || ''
          });

        if (movementError) throw movementError;
      }
    } catch (error) {
      console.error('Error updating inventory after exam:', error);
      throw error;
    }
  }
};
