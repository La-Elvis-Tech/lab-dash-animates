
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  User, 
  Calendar,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { gsap } from "gsap";
import { toast } from "@/hooks/use-toast";

// Mock data para alertas
const mockAlerts = [
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
    status: "active"
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
    status: "active"
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
    status: "active"
  }
];

// Mock data para histórico de alertas resolvidos
const mockResolvedAlerts = [
  {
    id: "R001",
    type: "stock",
    title: "Estoque Crítico - Pipetas 10mL",
    resolvedAt: new Date(2024, 5, 8, 11, 20),
    resolvedBy: "Ana Paula",
    action: "Reposição realizada - 50 unidades",
    status: "resolved"
  },
  {
    id: "R002",
    type: "expiry",
    title: "Vencimento Próximo - Buffer Z",
    resolvedAt: new Date(2024, 5, 7, 15, 30),
    resolvedBy: "Carlos Pereira",
    action: "Item descartado conforme protocolo",
    status: "resolved"
  }
];

// Mock data para log de serviços
const mockServiceLogs = [
  {
    id: "L001",
    type: "inventory_update",
    action: "Aumento de estoque",
    item: "Etanol Absoluto",
    details: "Quantidade alterada de 2L para 10L",
    user: "Ana Paula",
    timestamp: new Date(2024, 5, 12, 10, 30),
    module: "Inventário"
  },
  {
    id: "L002",
    type: "order_created",
    action: "Pedido criado",
    item: "Luvas Nitrila",
    details: "Pedido #P001 - 200 pares",
    user: "Carlos Pereira",
    timestamp: new Date(2024, 5, 12, 9, 15),
    module: "Pedidos"
  },
  {
    id: "L003",
    type: "exam_completed",
    action: "Exame realizado",
    item: "Kit Teste COVID",
    details: "Paciente: João Silva - Resultado: Negativo",
    user: "Dra. Maria Santos",
    timestamp: new Date(2024, 5, 11, 16, 45),
    module: "Exames"
  },
  {
    id: "L004",
    type: "maintenance",
    action: "Manutenção preventiva",
    item: "Equipamento Análise",
    details: "Calibração e limpeza realizada",
    user: "Técnico João",
    timestamp: new Date(2024, 5, 11, 14, 20),
    module: "Equipamentos"
  }
];

const Alerts = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("alerts");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      default: return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock": return <Package size={16} />;
      case "expiry": return <Clock size={16} />;
      case "prediction": return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const handleQuickAction = (alertId: string, action: string) => {
    console.log(`Ação: ${action} para alerta: ${alertId}`);
    toast({
      title: "Ação executada",
      description: `${action} foi processada com sucesso`,
    });
  };

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const filteredLogs = mockServiceLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="rounded-lg mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Alertas & Notificações
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Gerencie alertas críticos e acompanhe o histórico de atividades
        </p>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  placeholder="Buscar alertas, itens ou usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-neutral-300 dark:border-neutral-600"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPriority === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPriority("all")}
                className="border-neutral-300 dark:border-neutral-600"
              >
                Todos
              </Button>
              <Button
                variant={filterPriority === "critical" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPriority("critical")}
                className="text-red-600 border-neutral-300 dark:border-neutral-600"
              >
                Crítico
              </Button>
              <Button
                variant={filterPriority === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPriority("high")}
                className="text-orange-600 border-neutral-300 dark:border-neutral-600"
              >
                Alto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-neutral-100 dark:bg-neutral-800">
          <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <Bell size={16} />
            Alertas Ativos
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <CheckCircle size={16} />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
            <User size={16} />
            Log de Serviços
          </TabsTrigger>
        </TabsList>

        {/* Alertas Ativos */}
        <TabsContent value="alerts" className="mt-0">
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {alert.title}
                          </h3>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority === "critical" ? "Crítico" : 
                             alert.priority === "high" ? "Alto" : "Médio"}
                          </Badge>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {format(alert.createdAt, "dd/MM/yyyy HH:mm")}
                          </span>
                          <span>Item: {alert.item}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickAction(alert.id, "Repor")}
                        className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900"
                      >
                        Repor
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleQuickAction(alert.id, "Reservar")}
                        className="border-neutral-300 dark:border-neutral-600"
                      >
                        Reservar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleQuickAction(alert.id, "Abrir Ticket")}
                        className="border-neutral-300 dark:border-neutral-600"
                      >
                        <ShoppingCart size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Histórico de Alertas Resolvidos */}
        <TabsContent value="resolved" className="mt-0">
          <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-neutral-100">Alertas Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockResolvedAlerts.map((alert) => (
                    <div key={alert.id} className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {alert.action}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {alert.resolvedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(alert.resolvedAt, "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          Resolvido
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Log de Serviços */}
        <TabsContent value="logs" className="mt-0">
          <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-neutral-100">Log de Atividades do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-neutral-300 dark:border-neutral-600">
                              {log.module}
                            </Badge>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {log.action}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            <span className="font-medium">Item:</span> {log.item}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {log.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(log.timestamp, "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;
