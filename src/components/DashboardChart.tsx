
import React, { useRef, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, RadialBar,
  PolarAngleAxis,
    RadarChart,
    PolarGrid,
  PolarAngleAxis as RadarAngleAxis,
  Radar,} from 'recharts';
import { gsap } from 'gsap';
import { Progress } from '@/components/ui/progress';
import GaugeChart from '@/components/ui/GaugeChart';

// Define a consistent color palette for all charts
// eslint-disable-next-line react-refresh/only-export-components
export const CHART_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#6366F1', '#EC4899', '#F59E0B'];

const DashboardChart = ({ type, data, title, description }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderProgressBars = () => {
    return (
      <div className="space-y-3 sm:space-y-6 py-2 sm:py-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={index} className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm font-bold">R$ {item.value.toFixed(2)}</span>
                  <span className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-medium">
                    {percentage}%
                  </span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-1.5 sm:h-2.5"
                style={{
                  background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.2))',
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400} minHeight={100}>
            <BarChart data={data} margin={{  top: 10, right: 30, left:-30, bottom: 5 }} >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor', fontSize: '14px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <YAxis 
                tick={{ fill: 'currentColor', fontSize: '14px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)',
                  fontSize: '12px',
                  padding: '8px'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
              {data[0]?.value2 && <Bar dataKey="value2" fill="#1D2472" />}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6842c2" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300} minHeight={200} minWidth={300}>
            <LineChart data={data} margin={{ top: 10, right: 0, left:-30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor', fontSize: '14px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <YAxis 
                tick={{ fill: 'currentColor', fontSize: '14px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)',
                  fontSize: '12px',
                  padding: '8px'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="url(#lineGradient)" 
                strokeWidth={3} 
                dot={{ fill: '#1a0bf7ab', r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              {data[0]?.value2 && 
                <Line 
                  type="monotone" 
                  dataKey="value2" 
                  stroke="#0EA5E9" 
                  strokeWidth={2} 
                  dot={{ fill: '#1a0bf7ab', r: 4 }} 
                />
              }
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1a0bf7ab"/>
                  <stop offset="100%" stopColor="#1a0bf7ab"/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor', fontSize: '12px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <YAxis 
                tick={{ fill: 'currentColor', fontSize: '12px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)',
                  fontSize: '12px',
                  padding: '8px'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a0bf7ab" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#1a0bf7ab" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#ffffff" fillOpacity={1} fill="url(#areaGradient)" strokeWidth={2} strokeOpacity={0.4} />
              {data[0]?.value2 && <Area type="monotone" dataKey="value2" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <RadarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <PolarGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <RadarAngleAxis
                dataKey="name"
                tick={{ fill: 'currentColor', fontSize: '12px' }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <YAxis
                tick={false}
                axisLine={false}
                tickLine={false}
                domain={[0, 'dataMax']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)',
                  fontSize: '12px',
                  padding: '8px',
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Radar
                name={title}
                dataKey="value"
                stroke="url(#radarGradient)"
                fill="url(#radarGradient)"
                fillOpacity={0.6}
              />
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#D946EF" />
                </linearGradient>
              </defs>
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
              <Pie
                data={data}
                cx="50%"
                cy="80%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={8}
                startAngle={180}
                endAngle={0}
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                strokeOpacity={0.1}
                stroke="transparent"
                strokeWidth={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)',
                  fontSize: '12px',
                  padding: '8px'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'progress':
        return renderProgressBars();
      case 'gauge':
        return <GaugeChart value={data[0].value} size={200} title={title} />;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={chartRef}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-950/70 dark:to-neutral-950 p-3 sm:p-4 md:p-6 rounded-xl shadow-lg transition-colors duration-300 "
    >
      <div className="mb-3 sm:mb-6 p-3">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2">{title}</h3>
        <p className=" sm:text-base text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      {renderChart()}
    </div>
  );
};

export default DashboardChart;
