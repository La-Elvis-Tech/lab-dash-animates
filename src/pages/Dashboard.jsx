import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import DashboardChart from '../components/DashboardChart';
import { Card, CardContent } from '../components/ui/card';
import { Activity, TrendingUp, TrendingDown, AlertCircle, Package, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dashboardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-card',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: 'power2.out' 
        }
      );

      gsap.fromTo(
        '.dashboard-chart',
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  const consumptionData = [
    { name: 'Jan', value: 23 },
    { name: 'Fev', value: 34 },
    { name: 'Mar', value: 45 },
    { name: 'Abr', value: 31 },
    { name: 'Mai', value: 42 },
    { name: 'Jun', value: 52 },
    { name: 'Jul', value: 49 },
  ];

  const inventoryData = [
    { name: 'Reagentes', value: 35 },
    { name: 'Vidraria', value: 28 },
    { name: 'Equipamentos', value: 17 },
    { name: 'Descartáveis', value: 20 },
  ];

  const itemsNearDepletion = [
    { id: 1, name: 'Etanol Absoluto', currentStock: 3, minStock: 5, unit: 'Litros' },
    { id: 2, name: 'Luvas de Nitrila', currentStock: 10, minStock: 50, unit: 'Pares' },
    { id: 3, name: 'Placas de Petri', currentStock: 15, minStock: 25, unit: 'Unidades' },
    { id: 4, name: 'Tubos de Ensaio', currentStock: 8, minStock: 20, unit: 'Unidades' },
  ];

  return (
    <div ref={dashboardRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do consumo de itens laboratoriais</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Itens</p>
                <h3 className="text-2xl font-bold mt-1">1,284</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={14} className="mr-1" />
                  +2.5% este mês
                </p>
              </div>
              <div className="bg-lab-lightBlue p-3 rounded-full">
                <Package className="text-lab-blue" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Consumo Mensal</p>
                <h3 className="text-2xl font-bold mt-1">187</h3>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown size={14} className="mr-1" />
                  -1.8% este mês
                </p>
              </div>
              <div className="bg-lab-lightBlue p-3 rounded-full">
                <Activity className="text-lab-blue" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Reagentes</p>
                <h3 className="text-2xl font-bold mt-1">362</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={14} className="mr-1" />
                  +5.2% este mês
                </p>
              </div>
              <div className="bg-lab-lightBlue p-3 rounded-full">
                <Beaker className="text-lab-blue" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Em Alerta</p>
                <h3 className="text-2xl font-bold mt-1">12</h3>
                <p className="text-xs text-yellow-600 flex items-center mt-1">
                  <AlertCircle size={14} className="mr-1" />
                  Requer atenção
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-chart">
          <DashboardChart 
            type="line" 
            data={consumptionData} 
            title="Consumo de Itens" 
            description="Itens consumidos nos últimos 7 meses" 
          />
        </div>
        <div className="dashboard-chart">
          <DashboardChart 
            type="pie" 
            data={inventoryData} 
            title="Distribuição de Inventário" 
            description="Distribuição dos itens por categoria" 
          />
        </div>
      </div>

      {/* Items running low */}
      <div className="dashboard-chart">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Itens em Baixo Estoque</h2>
              <Link to="/inventory" className="text-sm text-lab-blue hover:underline">
                Ver Todos
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-2 font-medium">Nome do Item</th>
                    <th className="pb-2 font-medium">Estoque Atual</th>
                    <th className="pb-2 font-medium">Estoque Mínimo</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsNearDepletion.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">{item.name}</td>
                      <td className="py-3 text-sm">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-3 text-sm">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Crítico
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
              
      </div>
    </div>
  );
};

export default Dashboard;
