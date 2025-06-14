
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityItem {
  title: string;
  description: string;
  day: string;
  date: string;
  time: string;
  paciente?: string;
  responsavel?: string;
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      // Buscar últimos agendamentos
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          patient_name,
          scheduled_date,
          exam_types(name)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      // Buscar últimas movimentações de estoque
      const { data: movements } = await supabase
        .from('inventory_movements')
        .select(`
          movement_type,
          reason,
          created_at,
          inventory_items(name)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      const activities: ActivityItem[] = [];

      // Adicionar agendamentos
      appointments?.forEach(appointment => {
        const date = new Date(appointment.scheduled_date);
        activities.push({
          title: "Exame",
          description: appointment.exam_types?.name || "Exame",
          day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          paciente: appointment.patient_name
        });
      });

      // Adicionar movimentações
      movements?.forEach(movement => {
        const date = new Date(movement.created_at);
        activities.push({
          title: movement.movement_type === 'in' ? "Reposição" : "Consumo",
          description: `${movement.movement_type === 'in' ? 'Reposição' : 'Uso'} de ${movement.inventory_items?.name}`,
          day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          responsavel: "Sistema"
        });
      });

      return activities
        .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
        .slice(0, 8);
    }
  });
};
