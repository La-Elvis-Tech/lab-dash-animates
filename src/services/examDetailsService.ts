
import { supabase } from '@/integrations/supabase/client';
import { ExamDetails, ExamMaterial } from '@/types/examDetails';

export const examDetailsService = {
  async getExamDetails(examTypeId: string): Promise<ExamDetails | null> {
    try {
      // Buscar dados básicos do exame
      const { data: examData, error: examError } = await supabase
        .from('exam_types')
        .select('*')
        .eq('id', examTypeId)
        .single();

      if (examError) throw examError;
      if (!examData) return null;

      // Buscar materiais necessários para o exame
      const { data: materialsData, error: materialsError } = await supabase
        .rpc('calculate_detailed_exam_materials', {
          p_exam_type_id: examTypeId,
          p_blood_exams: []
        });

      if (materialsError) throw materialsError;

      const materials: ExamMaterial[] = materialsData || [];
      const totalMaterialCost = materials.reduce((sum, material) => sum + material.estimated_cost, 0);
      const materialsAvailable = materials.every(material => material.sufficient_stock);

      return {
        id: examData.id,
        name: examData.name,
        description: examData.description,
        category: examData.category,
        duration_minutes: examData.duration_minutes,
        cost: examData.cost,
        preparation: {
          requires_preparation: examData.requires_preparation,
          preparation_instructions: examData.preparation_instructions
        },
        materials,
        total_material_cost: totalMaterialCost,
        materials_available: materialsAvailable
      };
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw error;
    }
  },

  async getAllExamsWithMaterials(): Promise<ExamDetails[]> {
    try {
      const { data: exams, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      const examDetails = await Promise.all(
        exams.map(async (exam) => {
          const details = await this.getExamDetails(exam.id);
          return details;
        })
      );

      return examDetails.filter(Boolean) as ExamDetails[];
    } catch (error) {
      console.error('Error fetching all exams with materials:', error);
      throw error;
    }
  },

  async validateExamMaterials(examTypeId: string): Promise<{
    canPerform: boolean;
    missingMaterials: ExamMaterial[];
    totalCost: number;
  }> {
    try {
      const examDetails = await this.getExamDetails(examTypeId);
      if (!examDetails) {
        return { canPerform: false, missingMaterials: [], totalCost: 0 };
      }

      const missingMaterials = examDetails.materials.filter(
        material => !material.sufficient_stock
      );

      return {
        canPerform: missingMaterials.length === 0,
        missingMaterials,
        totalCost: examDetails.total_material_cost
      };
    } catch (error) {
      console.error('Error validating exam materials:', error);
      throw error;
    }
  }
};
