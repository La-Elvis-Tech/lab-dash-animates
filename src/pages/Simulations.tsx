import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Import refactored components
import SimulationParameters from "@/components/simulations/SimulationParameters";
import SimulationActions from "@/components/simulations/SimulationActions";
import ScheduledSimulations from "@/components/simulations/ScheduledSimulations";

// Keep existing imports for other components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  Target,
  AlertTriangle,
  GitCompare
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SimulationScenario {
  id: string;
  name: string;
  demandChange: number;
  leadTimeVariability: number;
  safetyStock: number;
  budgetLimit: number;
  serviceLevel: number;
  seasonalityFactor: number;
  riskTolerance: number;
  createdAt: Date;
}

interface SimulationResult {
  id: string;
  scenarioId: string;
  stockoutProbability: number;
  averageStockLevel: number;
  totalCost: number;
  serviceLevel: number;
  recommendations: string[];
  risks: string[];
  runAt: Date;
}

const templates = {
  "seasonal-growth": {
    name: "Crescimento Sazonal",
    demandChange: 25,
    leadTimeVariability: 15,
    safetyStock: 10,
    budgetLimit: 75000,
    serviceLevel: 98,
    seasonalityFactor: 1.3,
    riskTolerance: 3
  },
  "supplier-crisis": {
    name: "Crise de Fornecimento",
    demandChange: -10,
    leadTimeVariability: 45,
    safetyStock: 14,
    budgetLimit: 40000,
    serviceLevel: 90,
    seasonalityFactor: 1,
    riskTolerance: 8
  },
  "new-exam-demand": {
    name: "Novo Exame em Alta",
    demandChange: 40,
    leadTimeVariability: 25,
    safetyStock: 12,
    budgetLimit: 60000,
    serviceLevel: 96,
    seasonalityFactor: 1.1,
    riskTolerance: 4
  }
};

const Simulations = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [selectedScenariosForComparison, setSelectedScenariosForComparison] = useState<string[]>([]);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>({
    id: "",
    name: "Cenário Padrão",
    demandChange: 0,
    leadTimeVariability: 20,
    safetyStock: 7,
    budgetLimit: 50000,
    serviceLevel: 95,
    seasonalityFactor: 1,
    riskTolerance: 5,
    createdAt: new Date()
  });
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const containerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".simulation-container > *",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const applyTemplate = (templateKey: string) => {
    if (templateKey === "custom") return;
    
    const template = templates[templateKey as keyof typeof templates];
    setCurrentScenario(prev => ({
      ...prev,
      ...template,
      name: template.name
    }));
    
    toast({
      title: "Template aplicado",
      description: `Cenário "${template.name}" foi carregado com sucesso.`,
    });
  };

  const runSimulation = async () => {
    setIsRunning(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calcular resultados baseados nos parâmetros
    const stockoutProb = Math.max(0, 
      15 - (currentScenario.safetyStock * 1.5) + 
      (currentScenario.demandChange * 0.3) + 
      (currentScenario.leadTimeVariability * 0.2)
    );
    
    const avgStock = currentScenario.safetyStock * 30 * (1 + currentScenario.demandChange / 100);
    const totalCost = avgStock * 15 + (stockoutProb * 1000);
    
    const newResult: SimulationResult = {
      id: Date.now().toString(),
      scenarioId: currentScenario.id || Date.now().toString(),
      stockoutProbability: Math.round(stockoutProb * 100) / 100,
      averageStockLevel: Math.round(avgStock),
      totalCost: Math.round(totalCost),
      serviceLevel: Math.max(85, currentScenario.serviceLevel - stockoutProb),
      recommendations: generateRecommendations(stockoutProb, avgStock, currentScenario),
      risks: generateRisks(stockoutProb, currentScenario),
      runAt: new Date()
    };
    
    setResults(prev => [newResult, ...prev]);
    setIsRunning(false);
    
    // Verificar se resultado é crítico e notificar
    if (newResult.stockoutProbability > 15) {
      toast({
        title: "⚠️ Resultado Crítico",
        description: `Probabilidade de ruptura elevada: ${newResult.stockoutProbability}%`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Simulação concluída",
        description: `Probabilidade de ruptura: ${newResult.stockoutProbability}%`,
      });
    }
  };

  const generateRecommendations = (stockoutProb: number, avgStock: number, scenario: SimulationScenario): string[] => {
    const recommendations = [];
    
    if (stockoutProb > 10) {
      recommendations.push("Aumentar safety stock em 20% para reduzir risco de ruptura");
    }
    if (scenario.leadTimeVariability > 30) {
      recommendations.push("Diversificar fornecedores para reduzir variabilidade de entrega");
    }
    if (avgStock > 1000) {
      recommendations.push("Otimizar tamanho de lotes para reduzir custo de estoque");
    }
    if (scenario.serviceLevel < 95) {
      recommendations.push("Aumentar nível de serviço target para 95% ou superior");
    }
    
    return recommendations;
  };

  const generateRisks = (stockoutProb: number, scenario: SimulationScenario): string[] => {
    const risks = [];
    
    if (stockoutProb > 15) {
      risks.push("Alto risco de ruptura de estoque");
    }
    if (scenario.budgetLimit < 45000) {
      risks.push("Orçamento limitado pode restringir reposições");
    }
    if (scenario.leadTimeVariability > 35) {
      risks.push("Alta variabilidade de lead time aumenta incerteza");
    }
    
    return risks;
  };

  const saveScenario = () => {
    const newScenario = {
      ...currentScenario,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setScenarios(prev => [newScenario, ...prev]);
    toast({
      title: "Cenário salvo",
      description: `"${newScenario.name}" foi salvo com sucesso.`,
    });
  };

  const exportResults = () => {
    // Simular exportação
    toast({
      title: "Relatório exportado",
      description: "Resultados da simulação foram exportados em PDF.",
    });
  };

  const scheduleSimulation = () => {
    toast({
      title: "Funcionalidade disponível",
      description: "Acesse a aba 'Simulações Agendadas' para configurar execuções automáticas.",
    });
  };

  const toggleScenarioForComparison = (scenarioId: string) => {
    setSelectedScenariosForComparison(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      } else if (prev.length < 3) {
        return [...prev, scenarioId];
      } else {
        toast({
          title: "Limite excedido",
          description: "Máximo de 3 cenários para comparação.",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  const getSelectedScenariosData = () => {
    return selectedScenariosForComparison.map(id => {
      const scenario = scenarios.find(s => s.id === id);
      const result = results.find(r => r.scenarioId === id);
      return { scenario, result };
    }).filter(item => item.scenario);
  };

  const clearComparison = () => {
    setSelectedScenariosForComparison([]);
  };

  const handleScheduleCreate = (schedule: any) => {
    console.log("Nova simulação agendada:", schedule);
  };

  return (
    <div ref={containerRef} className="space-y-6 simulation-container">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Simulações de Estoque
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Modele cenários e otimize políticas de reabastecimento
        </p>
      </div>

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-100 dark:bg-neutral-800">
          <TabsTrigger value="parameters" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">Parâmetros</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">Resultados</TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">Cenários Salvos</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">Agendadas</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <SimulationParameters
                currentScenario={currentScenario}
                setCurrentScenario={setCurrentScenario}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                applyTemplate={applyTemplate}
              />
            </div>
            <div>
              <SimulationActions
                isRunning={isRunning}
                onRunSimulation={runSimulation}
                onSaveScenario={saveScenario}
                onExportResults={exportResults}
                onScheduleSimulation={scheduleSimulation}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledSimulations
            scenarios={scenarios}
            onScheduleCreate={handleScheduleCreate}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results.length === 0 ? (
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardContent className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                  Nenhuma simulação executada ainda
                </p>
                <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
                  Execute uma simulação na aba Parâmetros para ver os resultados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {results.map((result, index) => (
                <Card key={result.id} className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-neutral-900 dark:text-neutral-100">
                          Resultado da Simulação #{results.length - index}
                        </CardTitle>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Executado em {result.runAt.toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant={result.stockoutProbability > 10 ? "destructive" : "default"}
                        className="px-3 py-1"
                      >
                        {result.stockoutProbability > 10 ? "Alto Risco" : "Baixo Risco"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                          {result.stockoutProbability}%
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Prob. Ruptura</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                          {result.averageStockLevel}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Estoque Médio</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                          R$ {result.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Custo Total</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                          {result.serviceLevel.toFixed(1)}%
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Nível Serviço</div>
                      </div>
                    </div>

                    {result.recommendations.length > 0 && (
                      <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                          <Target className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                          Recomendações
                        </h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.risks.length > 0 && (
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                          <AlertTriangle className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                          Riscos Identificados
                        </h4>
                        <ul className="space-y-2">
                          {result.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {scenarios.length === 0 ? (
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardContent className="text-center py-16">
                <Save className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                  Nenhum cenário salvo ainda
                </p>
                <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
                  Salve cenários na aba Parâmetros para acessá-los aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800
                    ${selectedScenariosForComparison.includes(scenario.id) ? 'ring-2 ring-neutral-400 dark:ring-neutral-600' : ''}`}
                  onClick={() => setCurrentScenario(scenario)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">{scenario.name}</CardTitle>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Criado em {scenario.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleScenarioForComparison(scenario.id);
                        }}
                        className={`ml-2 ${
                          selectedScenariosForComparison.includes(scenario.id) 
                            ? 'bg-neutral-100 border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300' 
                            : ''
                        }`}
                      >
                        <GitCompare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600 dark:text-neutral-400">Demanda:</span>
                        <div className="flex items-center gap-1">
                          {scenario.demandChange > 0 ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          ) : scenario.demandChange < 0 ? (
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-neutral-500" />
                          )}
                          <span className={scenario.demandChange > 0 ? "text-green-600 dark:text-green-400" : 
                                         scenario.demandChange < 0 ? "text-red-600 dark:text-red-400" : 
                                         "text-neutral-600 dark:text-neutral-400"}>
                            {scenario.demandChange > 0 ? '+' : ''}{scenario.demandChange}%
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Safety Stock:</span>
                        <span className="text-neutral-900 dark:text-neutral-100">{scenario.safetyStock} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">SLA Target:</span>
                        <span className="text-neutral-900 dark:text-neutral-100">{scenario.serviceLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Orçamento:</span>
                        <span className="text-neutral-900 dark:text-neutral-100">R$ {scenario.budgetLimit.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {selectedScenariosForComparison.length === 0 ? (
            <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
              <CardContent className="text-center py-16">
                <GitCompare className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                  Selecione cenários para comparar
                </p>
                <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
                  Vá para "Cenários Salvos" e clique no ícone de comparação para adicionar cenários.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Comparando {selectedScenariosForComparison.length} cenário(s)
                </h3>
                <Button 
                  variant="outline" 
                  onClick={clearComparison}
                  className="border-neutral-300 dark:border-neutral-600"
                >
                  Limpar Seleção
                </Button>
              </div>

              {/* Tabela de Comparação */}
              <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-neutral-900 dark:text-neutral-100">Comparação de Parâmetros</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-neutral-700 dark:text-neutral-300">Parâmetro</TableHead>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableHead key={scenario?.id} className="text-center text-neutral-700 dark:text-neutral-300">
                            {scenario?.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Mudança na Demanda</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center">
                            <Badge variant={
                              (scenario?.demandChange || 0) > 0 ? "default" : 
                              (scenario?.demandChange || 0) < 0 ? "destructive" : "secondary"
                            }>
                              {(scenario?.demandChange || 0) > 0 ? '+' : ''}{scenario?.demandChange}%
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Variabilidade Lead Time</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                            {scenario?.leadTimeVariability}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Safety Stock</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                            {scenario?.safetyStock} dias
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Orçamento</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                            R$ {scenario?.budgetLimit?.toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Nível de Serviço</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                            {scenario?.serviceLevel}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Tolerância a Risco</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center">
                            <Badge variant={(scenario?.riskTolerance || 0) > 8 ? "destructive" : "default"}>
                              {scenario?.riskTolerance}%
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Resultados da Comparação */}
              {getSelectedScenariosData().some(({ result }) => result) && (
                <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-neutral-900 dark:text-neutral-100">Resultados das Simulações</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-neutral-700 dark:text-neutral-300">Métrica</TableHead>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableHead key={scenario?.id} className="text-center text-neutral-700 dark:text-neutral-300">
                              {scenario?.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Prob. Ruptura</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center">
                              {result ? (
                                <Badge variant={result.stockoutProbability > 10 ? "destructive" : "default"}>
                                  {result.stockoutProbability}%
                                </Badge>
                              ) : (
                                <span className="text-neutral-400 dark:text-neutral-500">N/A</span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Estoque Médio</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                              {result ? result.averageStockLevel : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Custo Total</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                              {result ? `R$ ${result.totalCost.toLocaleString()}` : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-neutral-700 dark:text-neutral-300">Nível de Serviço</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center text-neutral-900 dark:text-neutral-100">
                              {result ? `${result.serviceLevel.toFixed(1)}%` : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;
