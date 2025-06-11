
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
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <BarChart3
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />
            Previsão de Demanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-300/40 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-neutral-900">
              <div>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {forecastData.nextMonth}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  itens próximo mês
                </p>
              </div>
              <div className="flex items-center gap-2">
                {forecastData.trend === "up" ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className="text-sm font-medium text-green-500">
                  +{forecastData.trendPercent}%
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 px-3">
              Intervalo: {forecastData.confidence.min} - {forecastData.confidence.max} itens
            </div>

            <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-indigo-700 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
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
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
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
