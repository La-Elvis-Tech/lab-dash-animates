
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, Package, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
  appointmentMetrics: any;
  inventoryMetrics: any;
  alertsCount: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  appointmentMetrics,
  inventoryMetrics,
  alertsCount
}) => {
  const cards = [
    {
      title: "Receita Total",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(appointmentMetrics.revenue),
      subtitle: "Total de exames concluídos",
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Agendamentos",
      value: appointmentMetrics.total.toString(),
      subtitle: `${appointmentMetrics.thisMonth} este mês`,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Itens em Estoque",
      value: inventoryMetrics.totalItems.toString(),
      subtitle: `${inventoryMetrics.lowStock} em estoque baixo`,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Alertas Ativos",
      value: alertsCount.toString(),
      subtitle: `${inventoryMetrics.expiringSoon} vencendo em 30 dias`,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCards;
