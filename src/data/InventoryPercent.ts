
export interface InventoryPercentItem {
  name: string;
  value: number;
}

export const inventoryPercent: InventoryPercentItem[] = [
  { name: 'Reagentes', value: 35 },
  { name: 'Vidrária', value: 28 },
  { name: 'Equipamentos', value: 17 },
  { name: 'Descartáveis', value: 20 },
];

// API Simulation Function - Ready for backend integration
export const getInventoryPercent = async (): Promise<InventoryPercentItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(inventoryPercent), 100);
  });
};
