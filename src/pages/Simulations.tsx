
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
  Settings2
} from "lucide-react";

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

  return (
    <div ref={containerRef} className="space-y-6 simulation-container">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Simulações de Estoque
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Modele cenários e otimize políticas de reabastecimento
        </p>
      </div>

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários Salvos</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Templates de Cenário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={(value) => {
                setSelectedTemplate(value);
                applyTemplate(value);
              }}>
                <SelectTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Variação de Demanda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome do Cenário</Label>
                  <Input
                    value={currentScenario.name}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Ex: Cenário COVID-19"
                  />
                </div>
                
                <div>
                  <Label>Mudança na Demanda (%)</Label>
                  <div className="px-3">
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
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>-30%</span>
                    <span className="font-medium">{currentScenario.demandChange > 0 ? '+' : ''}{currentScenario.demandChange}%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div>
                  <Label>Fator de Sazonalidade</Label>
                  <div className="px-3">
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
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span className="font-medium">{currentScenario.seasonalityFactor}x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Time e Fornecedores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Lead Time & Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Variabilidade do Lead Time (%)</Label>
                  <div className="px-3">
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
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>5%</span>
                    <span className="font-medium">{currentScenario.leadTimeVariability}%</span>
                    <span>60%</span>
                  </div>
                </div>

                <div>
                  <Label>Safety Stock (dias)</Label>
                  <div className="px-3">
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
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>3 dias</span>
                    <span className="font-medium">{currentScenario.safetyStock} dias</span>
                    <span>21 dias</span>
                  </div>
                </div>

                <div>
                  <Label>Tolerância a Risco (%)</Label>
                  <div className="px-3">
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
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1%</span>
                    <span className="font-medium">{currentScenario.riskTolerance}%</span>
                    <span>15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orçamento e SLA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Orçamento & SLA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Orçamento Mensal (R$)</Label>
                  <Input
                    type="number"
                    value={currentScenario.budgetLimit}
                    onChange={(e) => setCurrentScenario(prev => ({
                      ...prev,
                      budgetLimit: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <Label>Nível de Serviço Target (%)</Label>
                  <div className="px-3">
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
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>85%</span>
                    <span className="font-medium">{currentScenario.serviceLevel}%</span>
                    <span>99%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Executar Simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="w-full"
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
                    <div className="flex justify-between text-sm">
                      <span>Processando Monte Carlo...</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="w-full" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveScenario} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={exportResults} className="flex-1">
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
            <Card>
              <CardContent className="text-center py-10">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma simulação executada ainda. Execute uma simulação na aba Parâmetros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Resultado da Simulação #{results.length - index}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Executado em {result.runAt.toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant={result.stockoutProbability > 10 ? "destructive" : "default"}
                      >
                        {result.stockoutProbability > 10 ? "Alto Risco" : "Baixo Risco"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {result.stockoutProbability}%
                        </div>
                        <div className="text-sm text-gray-500">Prob. Ruptura</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {result.averageStockLevel}
                        </div>
                        <div className="text-sm text-gray-500">Estoque Médio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          R$ {result.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Custo Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {result.serviceLevel.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Nível Serviço</div>
                      </div>
                    </div>

                    {result.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recomendações
                        </h4>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.risks.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Riscos Identificados
                        </h4>
                        <ul className="space-y-1">
                          {result.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
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
            <Card>
              <CardContent className="text-center py-10">
                <Save className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum cenário salvo ainda. Salve cenários na aba Parâmetros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentScenario(scenario)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Criado em {scenario.createdAt.toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Demanda:</span>
                        <span className={scenario.demandChange > 0 ? "text-green-600" : "text-red-600"}>
                          {scenario.demandChange > 0 ? '+' : ''}{scenario.demandChange}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safety Stock:</span>
                        <span>{scenario.safetyStock} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SLA Target:</span>
                        <span>{scenario.serviceLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orçamento:</span>
                        <span>R$ {scenario.budgetLimit.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardContent className="text-center py-10">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Funcionalidade de comparação em desenvolvimento.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Em breve você poderá comparar múltiplos cenários lado a lado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;
