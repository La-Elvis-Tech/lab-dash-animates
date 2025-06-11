
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Package } from "lucide-react";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Rupturas Imediatas */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
            <Package size={16} />
            Rupturas Imediatas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {criticalItems.length}
              </span>
              <Link 
                to="/inventory?filter=critical" 
                className="text-xs text-red-600 hover:underline"
              >
                Ver Críticos
              </Link>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {criticalItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate">{item.name}</span>
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
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Clock size={16} />
            Vencimentos (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {expiringItems.length}
              </span>
              <Link 
                to="/inventory?filter=expiring" 
                className="text-xs text-amber-600 hover:underline"
              >
                Ver Todos
              </Link>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {expiringItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate">{item.name}</span>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
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
