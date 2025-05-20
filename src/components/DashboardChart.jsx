
import React, { useRef, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { gsap } from 'gsap';

const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#6366F1', '#EC4899', '#F59E0B'];

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

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
              <YAxis tick={{ fill: 'currentColor' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend />
              <Bar dataKey="value" fill="url(#barGradient)" />
              {data[0]?.value2 && <Bar dataKey="value2" fill="#1D2472" />}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#D946EF" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.3} />
              <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
              <YAxis tick={{ fill: 'currentColor' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={{ fill: '#8B5CF6' }} activeDot={{ r: 6 }} />
              {data[0]?.value2 && <Line type="monotone" dataKey="value2" stroke="#0EA5E9" strokeWidth={2} dot={{ fill: '#0EA5E9' }} />}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#D946EF"/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
              <YAxis tick={{ fill: 'currentColor' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#areaGradient)" />
              {data[0]?.value2 && <Area type="monotone" dataKey="value2" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#ffffff"
                dataKey="value"
                stroke="#8589b484"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)'
                }}
                itemStyle={{ color: 'rgb(243 244 246)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={chartRef}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg transition-colors duration-300 dark:border-neutral-800 dark:border-2 dark:border-opacity-20"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      {renderChart()}
    </div>
  );
};

export default DashboardChart;
