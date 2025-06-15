
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useExamTypes = () => {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchExamTypes();
  }, []);

  return {
    examTypes,
    loading,
    refreshExamTypes: fetchExamTypes,
  };
};
