
export interface ConsumptionData {
  name: string;
  value: number;
}

export interface ActivityItem {
  title: string;
  description: string;
  day: string;
  date: string;
  time: string;
  paciente?: string;
  responsavel?: string;
}

export const dashboardConsumptionData: ConsumptionData[] = [
  { name: "Jan", value: 23 },
  { name: "Fev", value: 34 },
  { name: "Mar", value: 45 },
  { name: "Abr", value: 31 },
  { name: "Mai", value: 42 },
  { name: "Jun", value: 52 },
  { name: "Jul", value: 49 },
];

// API Simulation Functions - Ready for backend integration
export const getDashboardConsumption = async (): Promise<ConsumptionData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(dashboardConsumptionData), 100);
  });
};

export const getDashboardStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      totalItems: 150,
      lowStockItems: 12,
      expiringItems: 8,
      monthlyConsumption: 340
    }), 100);
  });
};
