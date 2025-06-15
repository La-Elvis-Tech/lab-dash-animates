
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useEmailAlerts } from "./useEmailAlerts";
import { useUserProfile } from "./useUserProfile";

export interface Alert {
  id: string;
  type: "stock" | "expiry" | "prediction";
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  item: string;
  unit_id?: string;
  unit_name?: string;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: Date;
  lot?: string;
  predictedDate?: Date;
  createdAt: Date;
  status: "active" | "resolved";
  isRead: boolean;
}

export interface ResolvedAlert {
  id: string;
  type: "stock" | "expiry" | "prediction";
  title: string;
  resolvedAt: Date;
  resolvedBy: string;
  action: string;
  status: "resolved";
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hasShownToast, setHasShownToast] = useState(false);
  const { sendAlertEmail } = useEmailAlerts();
  const { profile } = useUserProfile();

  // Mock data com status de leitura filtrado por unidade
  const generateMockAlerts = (): Alert[] => {
    const baseAlerts: Alert[] = [
      {
        id: "A001",
        type: "stock",
        priority: "critical",
        title: "Estoque Crítico - Etanol Absoluto",
        description: "Apenas 2L restantes (mínimo: 5L)",
        item: "Etanol Absoluto",
        unit_id: "550e8400-e29b-41d4-a716-446655440101",
        unit_name: "Matriz - Centro",
        currentStock: 2,
        minStock: 5,
        unit: "L",
        createdAt: new Date(2024, 5, 10, 14, 30),
        status: "active",
        isRead: false
      },
      {
        id: "A002",
        type: "expiry",
        priority: "high",
        title: "Vencimento Próximo - Reagente X",
        description: "Vence em 3 dias (Lote: LT-2024-001)",
        item: "Reagente X",
        unit_id: "550e8400-e29b-41d4-a716-446655440101",
        unit_name: "Matriz - Centro",
        expiryDate: new Date(2024, 5, 15),
        lot: "LT-2024-001",
        createdAt: new Date(2024, 5, 10, 9, 15),
        status: "active",
        isRead: true
      },
      {
        id: "A003",
        type: "prediction",
        priority: "medium",
        title: "Predição de Ruptura - Luvas Nitrila",
        description: "Estoque pode esgotar em 7 dias baseado no consumo atual",
        item: "Luvas Nitrila",
        unit_id: "550e8400-e29b-41d4-a716-446655440102",
        unit_name: "Filial - Zona Sul",
        predictedDate: new Date(2024, 5, 19),
        createdAt: new Date(2024, 5, 10, 16, 45),
        status: "active",
        isRead: false
      },
      {
        id: "A004",
        type: "stock",
        priority: "high",
        title: "Estoque Baixo - Tubos de Ensaio",
        description: "Apenas 15 unidades restantes (mínimo: 50)",
        item: "Tubos de Ensaio",
        unit_id: "550e8400-e29b-41d4-a716-446655440101",
        unit_name: "Matriz - Centro",
        currentStock: 15,
        minStock: 50,
        unit: "unidades",
        createdAt: new Date(2024, 5, 12, 8, 20),
        status: "active",
        isRead: false
      },
      {
        id: "A005",
        type: "stock",
        priority: "medium",
        title: "Estoque Baixo - Ponteiras 1000μl",
        description: "Apenas 80 unidades restantes (mínimo: 200)",
        item: "Ponteiras 1000μl",
        unit_id: "550e8400-e29b-41d4-a716-446655440102",
        unit_name: "Filial - Zona Sul",
        currentStock: 80,
        minStock: 200,
        unit: "unidades",
        createdAt: new Date(2024, 5, 13, 10, 30),
        status: "active",
        isRead: false
      }
    ];

    // Filtrar alertas por unidade do usuário se disponível
    if (profile?.unit_id) {
      return baseAlerts.filter(alert => alert.unit_id === profile.unit_id);
    }

    // Se for admin ou não tiver unidade específica, mostrar todos
    return baseAlerts;
  };

  useEffect(() => {
    if (profile) {
      const filteredAlerts = generateMockAlerts();
      setAlerts(filteredAlerts);
    }
  }, [profile]);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, isRead: true }))
    );
  };

  const getUnreadCount = () => {
    return alerts.filter(alert => !alert.isRead && alert.status === "active").length;
  };

  const getUnreadAlerts = () => {
    return alerts.filter(alert => !alert.isRead && alert.status === "active");
  };

  const getCriticalUnreadAlerts = () => {
    return alerts.filter(alert => 
      !alert.isRead && 
      alert.status === "active" && 
      (alert.priority === "critical" || alert.priority === "high")
    );
  };

  // Enviar alertas por email automaticamente
  const sendEmailForAlert = async (alert: Alert) => {
    await sendAlertEmail({
      type: alert.type,
      title: alert.title,
      description: alert.description,
      item: alert.item,
      priority: alert.priority,
      currentStock: alert.currentStock,
      minStock: alert.minStock,
      unit: alert.unit,
      expiryDate: alert.expiryDate?.toISOString().split('T')[0],
      lot: alert.lot,
      predictedDate: alert.predictedDate?.toISOString().split('T')[0],
    });
  };

  // Mostrar toast com alertas não lidos ao carregar a página
  useEffect(() => {
    if (!hasShownToast && alerts.length > 0) {
      const criticalAlerts = getCriticalUnreadAlerts();
      const unreadCount = getUnreadCount();
      
      if (criticalAlerts.length > 0) {
        // Enviar alertas críticos por email
        criticalAlerts.forEach(alert => {
          sendEmailForAlert(alert);
        });

        const unitInfo = profile?.unit?.name ? ` na unidade ${profile.unit.name}` : '';
        
        toast({
          title: `${criticalAlerts.length} Alerta${criticalAlerts.length > 1 ? 's' : ''} Crítico${criticalAlerts.length > 1 ? 's' : ''}`,
          description: `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}${unitInfo}. Alertas enviados por email.`,
          variant: "destructive",
        });
      } else if (unreadCount > 0) {
        const unitInfo = profile?.unit?.name ? ` na unidade ${profile.unit.name}` : '';
        
        toast({
          title: "Novas Notificações",
          description: `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}${unitInfo}.`,
        });
      }
      
      setHasShownToast(true);
    }
  }, [hasShownToast, alerts, profile]);

  return {
    alerts,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadAlerts,
    getCriticalUnreadAlerts,
    sendEmailForAlert,
    userUnit: profile?.unit
  };
};
