
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Package, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const RiskAlertsCard: React.FC = () => {
  const criticalItems = [
    { name: "Etanol Absoluto", current: 3, min: 5, unit: "L", urgency: "critical" },
    { name: "Luvas Nitrila", current: 12, min: 50, unit: "pares", urgency: "high" },
    { name: "Pipetas 10mL", current: 8, min: 15, unit: "unid", urgency: "medium" }
  ];

  const expiringItems = [
    { name: "Reagente X", days: 5, lot: "LT-2024-001" },
    { name: "Solução Y", days: 12, lot: "LT-2024-045" },
    { name: "Buffer Z", days: 18, lot: "LT-2024-023" }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      case "high": return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getExpiryUrgencyColor = (days: number) => {
    if (days <= 7) return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
    if (days <= 15) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300";
    return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
  };

  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      {/* Rupturas Imediatas */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Package size={18} className="text-red-600 dark:text-red-400" />
            Rupturas Imediatas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/40 dark:to-orange-950/40 rounded-xl border border-red-200 dark:border-red-900/50">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {criticalItems.length}
              </span>
              <Link 
                to="/inventory?filter=critical" 
                className="text-sm text-red-600 hover:underline font-medium"
              >
                Ver Críticos
              </Link>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {criticalItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-neutral-950/80 rounded-lg text-sm">
                  <span className="truncate text-gray-800 dark:text-gray-200">{item.name}</span>
                  <Badge className={getUrgencyColor(item.urgency)}>
                    {item.current}/{item.min} {item.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vencimentos */}
      <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Clock size={18} className="text-purple-600 dark:text-purple-400" />
            Vencimentos (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 rounded-xl border border-purple-200 dark:border-purple-900/50">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {expiringItems.length}
              </span>
              <Link 
                to="/inventory?filter=expiring" 
                className="text-sm text-purple-600 hover:underline font-medium"
              >
                Ver Todos
              </Link>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expiringItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-neutral-950/80 rounded-lg text-sm">
                  <span className="truncate text-gray-800 dark:text-gray-200">{item.name}</span>
                  <Badge className={getExpiryUrgencyColor(item.days)}>
                    {item.days}d
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAlertsCard;
