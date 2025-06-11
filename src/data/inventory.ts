
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  location: string;
  size?: string | null;
  expiryDate?: string | null;
  lastUsed: string;
  status: string;
  minStock: number;
  maxStock: number;
  reservedForAppointments: number;
  consumptionHistory: number[];
}

export interface InventoryCategory {
  id: string;
  name: string;
  icon?: any;
}

export const inventoryCategories: InventoryCategory[] = [
  { id: "all", name: "Todos" },
  { id: "reagents", name: "Reagentes" },
  { id: "glassware", name: "Vidraria" },
  { id: "equipment", name: "Equipamentos" },
  { id: "disposable", name: "Descartáveis" },
];

export const inventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: "Ácido Sulfúrico",
    category: "reagents",
    stock: 18,
    unit: "Litros",
    location: "Armário A3",
    size: null,
    expiryDate: "2025-10-15",
    lastUsed: "2023-04-10",
    status: "ok",
    minStock: 15,
    maxStock: 50,
    reservedForAppointments: 3,
    consumptionHistory: [12, 15, 18, 22, 20, 18],
  },
  {
    id: 2,
    name: "Placas de Petri",
    category: "disposable",
    stock: 35,
    unit: "Unidades",
    location: "Armário D2",
    size: null,
    expiryDate: "2025-08-22",
    lastUsed: "2023-04-15",
    status: "ok",
    minStock: 20,
    maxStock: 100,
    reservedForAppointments: 8,
    consumptionHistory: [25, 30, 35, 40, 38, 35],
  },
  {
    id: 3,
    name: "Etanol Absoluto",
    category: "reagents",
    stock: 3,
    unit: "Litros",
    location: "Armário A1",
    size: null,
    expiryDate: "2024-12-15",
    lastUsed: "2023-04-12",
    status: "low",
    minStock: 10,
    maxStock: 30,
    reservedForAppointments: 1,
    consumptionHistory: [8, 10, 6, 4, 3, 3],
  },
  {
    id: 4,
    name: "Balão Volumétrico",
    category: "glassware",
    stock: 12,
    unit: "Unidades",
    location: "Armário G4",
    size: "500ml",
    expiryDate: null,
    lastUsed: "2023-03-28",
    status: "ok",
    minStock: 5,
    maxStock: 20,
    reservedForAppointments: 2,
    consumptionHistory: [8, 10, 12, 14, 12, 12],
  },
  {
    id: 5,
    name: "Luvas de Nitrila (M)",
    category: "disposable",
    stock: 10,
    unit: "Pares",
    location: "Armário D1",
    size: null,
    expiryDate: "2024-07-18",
    lastUsed: "2023-04-18",
    status: "low",
    minStock: 50,
    maxStock: 200,
    reservedForAppointments: 5,
    consumptionHistory: [45, 50, 35, 25, 15, 10],
  },
  {
    id: 6,
    name: "Microscópio Óptico",
    category: "equipment",
    stock: 5,
    unit: "Unidades",
    location: "Sala E2",
    expiryDate: null,
    lastUsed: "2023-04-05",
    status: "ok",
    minStock: 3,
    maxStock: 8,
    reservedForAppointments: 0,
    consumptionHistory: [5, 5, 5, 5, 5, 5],
  },
  {
    id: 7,
    name: "Pipeta Graduada",
    category: "glassware",
    stock: 25,
    unit: "Unidades",
    location: "Armário G2",
    size: "10ml",
    expiryDate: null,
    lastUsed: "2023-04-14",
    status: "ok",
    minStock: 15,
    maxStock: 40,
    reservedForAppointments: 4,
    consumptionHistory: [20, 22, 25, 28, 26, 25],
  },
  {
    id: 8,
    name: "Tubos de Ensaio",
    category: "glassware",
    stock: 8,
    unit: "Unidades",
    location: "Armário G3",
    size: "15ml",
    expiryDate: null,
    lastUsed: "2023-04-16",
    status: "low",
    minStock: 20,
    maxStock: 60,
    reservedForAppointments: 2,
    consumptionHistory: [35, 30, 25, 20, 15, 8],
  },
];

// API Simulation Functions - Ready for backend integration
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  // Simula chamada para API
  return new Promise((resolve) => {
    setTimeout(() => resolve(inventoryItems), 100);
  });
};

export const getInventoryCategories = async (): Promise<InventoryCategory[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(inventoryCategories), 100);
  });
};

export const updateInventoryItem = async (itemId: number, updatedData: Partial<InventoryItem>): Promise<InventoryItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = inventoryItems.find(i => i.id === itemId);
      if (item) {
        Object.assign(item, updatedData);
        resolve(item);
      }
    }, 100);
  });
};

export const reserveInventoryItem = async (itemId: number, quantity: number): Promise<InventoryItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = inventoryItems.find(i => i.id === itemId);
      if (item) {
        item.reservedForAppointments += quantity;
        item.stock -= quantity;
        resolve(item);
      }
    }, 100);
  });
};
