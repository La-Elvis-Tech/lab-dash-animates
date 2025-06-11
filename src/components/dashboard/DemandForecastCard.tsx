
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const DemandForecastCard: React.FC = () => {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [growthRate, setGrowthRate] = useState([5]);
  const [seasonality, setSeasonality] = useState([0]);

  const forecastData = {
    nextMonth: 215,
    confidence: { min: 195, max: 235 },
    trend: "up",
    trendPercent: 8.3,
    currentEstimate: 215 + (growthRate[0] * 2) + (seasonality[0] * 1.5)
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <BarChart3 size={16} />
            Previsão de Demanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {forecastData.nextMonth}
                </span>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  itens próximo mês
                </p>
              </div>
              <div className="flex items-center gap-1">
                {forecastData.trend === "up" ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className="text-sm font-medium text-green-500">
                  +{forecastData.trendPercent}%
                </span>
              </div>
            </div>
            
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Intervalo: {forecastData.confidence.min} - {forecastData.confidence.max} itens
            </div>

            <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-purple-700 border-purple-300">
                  Simular Cenário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Simulação de Demanda</DialogTitle>
                  <DialogDescription>
                    Ajuste os parâmetros para ver o impacto na previsão
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Taxa de Crescimento: {growthRate[0]}%</Label>
                    <Slider
                      value={growthRate}
                      onValueChange={setGrowthRate}
                      min={-20}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sazonalidade: {seasonality[0] > 0 ? '+' : ''}{seasonality[0]}%</Label>
                    <Slider
                      value={seasonality}
                      onValueChange={setSeasonality}
                      min={-30}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium">Resultado da Simulação:</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(forecastData.currentEstimate)} itens
                    </div>
                    <div className="text-xs text-gray-500">
                      Impacto: {Math.round(forecastData.currentEstimate - forecastData.nextMonth) > 0 ? '+' : ''}
                      {Math.round(forecastData.currentEstimate - forecastData.nextMonth)} itens
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setIsSimulationOpen(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DemandForecastCard;
