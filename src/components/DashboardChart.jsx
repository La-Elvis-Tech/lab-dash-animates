import React, { useRef, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { gsap } from 'gsap';

const COLORS = ['#080E49', '#1D2472', '#1D2AD7', '#919AF2', '#8B5CF6', '#C8CCF9'];

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
              <XAxis dataKey="name" tick={{ fill: 'text-gray-700 dark: text-gray-200' }} />
              <YAxis tick={{ fill: 'text-gray-700 dark: text-gray-200' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgb(31 41 55)',
                  borderColor: 'rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'rgb(243 244 246)'
                }}
                itemStyle={{ color: 'text-gray-700 dark: text-gray-200' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#080E49" />
              {data[0]?.value2 && <Bar dataKey="value2" fill="#1D2472" />}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid /* strokeDasharray="3 6"*/ stroke="currentColor" strokeOpacity={0.3} />
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
              <Line type="monotone" dataKey="value" stroke="#3a45a7" strokeWidth={3} />
              {data[0]?.value2 && <Line type="monotone" dataKey="value2" stroke="#535dc5" strokeWidth={2} />}
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
              <Area type="monotone" dataKey="value" stroke="#080E49" fill="rgba(59, 130, 246, 0.2)" />
              {data[0]?.value2 && <Area type="monotone" dataKey="value2" stroke="#1D2472" fill="#1D2472" />}
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
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors duration-300"
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