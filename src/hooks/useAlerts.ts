
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  type: "stock" | "expiry" | "prediction";
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  item: string;
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

// Mock data com status de leitura
const mockAlertsData: Alert[] = [
  {
    id: "A001",
    type: "stock",
    priority: "critical",
    title: "Estoque Crítico - Etanol Absoluto",
    description: "Apenas 2L restantes (mínimo: 5L)",
    item: "Etanol Absoluto",
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
    currentStock: 15,
    minStock: 50,
    unit: "unidades",
    createdAt: new Date(2024, 5, 12, 8, 20),
    status: "active",
    isRead: false
  }
];

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlertsData);
  const [hasShownToast, setHasShownToast] = useState(false);

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

  // Mostrar toast com alertas não lidos ao carregar a página
  useEffect(() => {
    if (!hasShownToast) {
      const criticalAlerts = getCriticalUnreadAlerts();
      const unreadCount = getUnreadCount();
      
      if (criticalAlerts.length > 0) {
        toast({
          title: `${criticalAlerts.length} Alerta${criticalAlerts.length > 1 ? 's' : ''} Crítico${criticalAlerts.length > 1 ? 's' : ''}`,
          description: `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''} no total. Verifique a seção de alertas.`,
          variant: "destructive",
        });
      } else if (unreadCount > 0) {
        toast({
          title: "Novas Notificações",
          description: `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}.`,
        });
      }
      
      setHasShownToast(true);
    }
  }, [hasShownToast]);

  return {
    alerts,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadAlerts,
    getCriticalUnreadAlerts
  };
};
