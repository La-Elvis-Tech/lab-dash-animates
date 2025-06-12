
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Save, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Target,
  DollarSign,
  Calendar,
  Zap,
  BarChart3,
  Settings2,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
  Plus,
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
    
    toast({
      title: "Simulação concluída",
      description: `Probabilidade de ruptura: ${newResult.stockoutProbability}%`,
    });
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

  return (
    <div ref={containerRef} className="space-y-6 simulation-container">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Simulações de Estoque
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Modele cenários e otimize políticas de reabastecimento
        </p>
      </div>

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="parameters" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Parâmetros</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Resultados</TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Cenários Salvos</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          {/* Templates */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Templates de Cenário
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={selectedTemplate} onValueChange={(value) => {
                setSelectedTemplate(value);
                applyTemplate(value);
              }}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Cenário Personalizado</SelectItem>
                  <SelectItem value="seasonal-growth">Crescimento Sazonal</SelectItem>
                  <SelectItem value="supplier-crisis">Crise de Fornecimento</SelectItem>
                  <SelectItem value="new-exam-demand">Novo Exame em Alta</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Parâmetros de Entrada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demanda */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Variação de Demanda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Nome do Cenário</Label>
                  <Input
                    value={currentScenario.name}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Ex: Cenário COVID-19"
                    className="mt-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Mudança na Demanda (%)</Label>
                  <div className="px-3 mt-3">
                    <Slider
                      value={[currentScenario.demandChange]}
                      onValueChange={([value]) => setCurrentScenario(prev => ({
                        ...prev,
                        demandChange: value
                      }))}
                      max={50}
                      min={-30}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>-30%</span>
                    <Badge variant={currentScenario.demandChange > 0 ? "default" : currentScenario.demandChange < 0 ? "destructive" : "secondary"}>
                      {currentScenario.demandChange > 0 ? '+' : ''}{currentScenario.demandChange}%
                    </Badge>
                    <span>+50%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Fator de Sazonalidade</Label>
                  <div className="px-3 mt-3">
                    <Slider
                      value={[currentScenario.seasonalityFactor]}
                      onValueChange={([value]) => setCurrentScenario(prev => ({
                        ...prev,
                        seasonalityFactor: value
                      }))}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>0.5x</span>
                    <Badge variant="outline">{currentScenario.seasonalityFactor}x</Badge>
                    <span>2.0x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Time e Fornecedores */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Lead Time & Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Variabilidade do Lead Time (%)</Label>
                  <div className="px-3 mt-3">
                    <Slider
                      value={[currentScenario.leadTimeVariability]}
                      onValueChange={([value]) => setCurrentScenario(prev => ({
                        ...prev,
                        leadTimeVariability: value
                      }))}
                      max={60}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>5%</span>
                    <Badge variant={currentScenario.leadTimeVariability > 35 ? "destructive" : "default"}>
                      {currentScenario.leadTimeVariability}%
                    </Badge>
                    <span>60%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Safety Stock (dias)</Label>
                  <div className="px-3 mt-3">
                    <Slider
                      value={[currentScenario.safetyStock]}
                      onValueChange={([value]) => setCurrentScenario(prev => ({
                        ...prev,
                        safetyStock: value
                      }))}
                      max={21}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>3 dias</span>
                    <Badge variant="outline">{currentScenario.safetyStock} dias</Badge>
                    <span>21 dias</span>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Tolerância a Risco (%)</Label>
                  <div className="px-3 mt-3">
                    <Slider
                      value={[currentScenario.riskTolerance]}
                      onValueChange={([value]) => setCurrentScenario(prev => ({
                        ...prev,
                        riskTolerance: value
                      }))}
                      max={15}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>1%</span>
                    <Badge variant={currentScenario.riskTolerance > 8 ? "destructive" : "default"}>
                      {currentScenario.riskTolerance}%
                    </Badge>
                    <span>15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orçamento e SLA */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Orçamento & SLA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Orçamento Mensal (R$)</Label>
                  <Input
                    type="number"
                    value={currentScenario.budgetLimit}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      budgetLimit: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="50000"
                    className="mt-2 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Nível de Serviço Target (%)</Label>
                  <div className="px-3 mt-3">
                    <Slider
                      value={[currentScenario.serviceLevel]}
                      onValueChange={([value]) => setCurrentScenario(prev => ({
                        ...prev,
                        serviceLevel: value
                      }))}
                      max={99}
                      min={85}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>85%</span>
                    <Badge variant={currentScenario.serviceLevel >= 95 ? "default" : "secondary"}>
                      {currentScenario.serviceLevel}%
                    </Badge>
                    <span>99%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Executar Simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Executar Simulação
                    </>
                  )}
                </Button>

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Processando Monte Carlo...</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="w-full" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveScenario} className="flex-1 border-gray-300 dark:border-gray-600">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={exportResults} className="flex-1 border-gray-300 dark:border-gray-600">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results.length === 0 ? (
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Nenhuma simulação executada ainda
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Execute uma simulação na aba Parâmetros para ver os resultados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {results.map((result, index) => (
                <Card key={result.id} className="border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gray-800 dark:text-gray-200">
                          Resultado da Simulação #{results.length - index}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {result.stockoutProbability}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Prob. Ruptura</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {result.averageStockLevel}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estoque Médio</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          R$ {result.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Custo Total</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {result.serviceLevel.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nível Serviço</div>
                      </div>
                    </div>

                    {result.recommendations.length > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Recomendações
                        </h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.risks.length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          Riscos Identificados
                        </h4>
                        <ul className="space-y-2">
                          {result.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
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
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-16">
                <Save className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Nenhum cenário salvo ainda
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Salve cenários na aba Parâmetros para acessá-los aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 
                    ${selectedScenariosForComparison.includes(scenario.id) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                  onClick={() => setCurrentScenario(scenario)}
                >
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-800 dark:text-gray-200">{scenario.name}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                            ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400' 
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
                        <span className="text-gray-600 dark:text-gray-400">Demanda:</span>
                        <div className="flex items-center gap-1">
                          {scenario.demandChange > 0 ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          ) : scenario.demandChange < 0 ? (
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500" />
                          )}
                          <span className={scenario.demandChange > 0 ? "text-green-600 dark:text-green-400" : 
                                         scenario.demandChange < 0 ? "text-red-600 dark:text-red-400" : 
                                         "text-gray-600 dark:text-gray-400"}>
                            {scenario.demandChange > 0 ? '+' : ''}{scenario.demandChange}%
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Safety Stock:</span>
                        <span className="text-gray-800 dark:text-gray-200">{scenario.safetyStock} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">SLA Target:</span>
                        <span className="text-gray-800 dark:text-gray-200">{scenario.serviceLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Orçamento:</span>
                        <span className="text-gray-800 dark:text-gray-200">R$ {scenario.budgetLimit.toLocaleString()}</span>
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
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-16">
                <GitCompare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Selecione cenários para comparar
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Vá para "Cenários Salvos" e clique no ícone de comparação para adicionar cenários.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Comparando {selectedScenariosForComparison.length} cenário(s)
                </h3>
                <Button 
                  variant="outline" 
                  onClick={clearComparison}
                  className="border-gray-300 dark:border-gray-600"
                >
                  Limpar Seleção
                </Button>
              </div>

              {/* Tabela de Comparação */}
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50">
                  <CardTitle className="text-gray-800 dark:text-gray-200">Comparação de Parâmetros</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-700 dark:text-gray-300">Parâmetro</TableHead>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableHead key={scenario?.id} className="text-center text-gray-700 dark:text-gray-300">
                            {scenario?.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">Mudança na Demanda</TableCell>
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
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">Variabilidade Lead Time</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
                            {scenario?.leadTimeVariability}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">Safety Stock</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
                            {scenario?.safetyStock} dias
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">Orçamento</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
                            R$ {scenario?.budgetLimit?.toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">Nível de Serviço</TableCell>
                        {getSelectedScenariosData().map(({ scenario }) => (
                          <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
                            {scenario?.serviceLevel}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">Tolerância a Risco</TableCell>
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
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardTitle className="text-gray-800 dark:text-gray-200">Resultados das Simulações</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700 dark:text-gray-300">Métrica</TableHead>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableHead key={scenario?.id} className="text-center text-gray-700 dark:text-gray-300">
                              {scenario?.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700 dark:text-gray-300">Prob. Ruptura</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center">
                              {result ? (
                                <Badge variant={result.stockoutProbability > 10 ? "destructive" : "default"}>
                                  {result.stockoutProbability}%
                                </Badge>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">N/A</span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700 dark:text-gray-300">Estoque Médio</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
                              {result ? result.averageStockLevel : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700 dark:text-gray-300">Custo Total</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
                              {result ? `R$ ${result.totalCost.toLocaleString()}` : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-gray-700 dark:text-gray-300">Nível de Serviço</TableCell>
                          {getSelectedScenariosData().map(({ scenario, result }) => (
                            <TableCell key={scenario?.id} className="text-center text-gray-800 dark:text-gray-200">
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
