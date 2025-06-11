
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  BarChart3, 
  Bell, 
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const QuickActionsCard: React.FC = () => {
  const [unreadAlerts] = useState(5);

  const quickActions = [
    {
      title: "Inventário Crítico",
      description: "12 itens abaixo do mínimo",
      icon: Package,
      link: "/inventory?filter=critical",
      urgency: "high"
    },
    {
      title: "Agendamentos Hoje",
      description: "8 sessões programadas",
      icon: Calendar,
      link: "/appointments",
      urgency: "medium"
    },
    {
      title: "Nova Simulação",
      description: "Prever cenários futuros",
      icon: BarChart3,
      link: "#",
      urgency: "low"
    }
  ];

  const getUrgencyIndicator = (urgency: string) => {
    switch (urgency) {
      case "high": return "border-l-4 border-red-500";
      case "medium": return "border-l-4 border-yellow-500";
      case "low": return "border-l-4 border-blue-500";
      default: return "";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package size={16} />
            Acesso Rápido
          </span>
          <div className="flex items-center gap-2">
            <Bell size={16} />
            {unreadAlerts > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {unreadAlerts}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`block p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getUrgencyIndicator(action.urgency)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <action.icon size={18} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))}

          {/* Alerts Feed */}
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Alertas Críticos
              </span>
            </div>
            <div className="space-y-1 text-xs text-red-600 dark:text-red-400">
              <div>⚠️ Etanol Absoluto: 3L / Min 5L</div>
              <div>⚠️ Luvas Nitrila: Estoque baixo</div>
              <div>⚠️ Reagente X: Vence em 5 dias</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
