
export interface Appointment {
  id: string;
  patient: string;
  type: string;
  date: Date;
  doctor: string;
  unit: string;
  cost: number;
  status: string;
}

export interface UnitSummary {
  name: string;
  count: number;
  appointments: Appointment[];
}

export const mockAppointments: Appointment[] = [
  {
    id: "A001",
    patient: "João Silva",
    type: "Coleta de Sangue",
    date: new Date(2024, 4, 15, 9, 30),
    doctor: "Dra. Ana Souza",
    unit: "Unidade Centro",
    cost: 120.0,
    status: "Concluído",
  },
  {
    id: "A002",
    patient: "Maria Santos",
    type: "Entrega de Resultado",
    date: new Date(2024, 4, 16, 10, 45),
    doctor: "Dr. Carlos Mendes",
    unit: "Unidade Norte",
    cost: 0,
    status: "Cancelado",
  },
  {
    id: "A003",
    patient: "Pedro Oliveira",
    type: "Colonoscopia",
    date: new Date(2024, 4, 22, 8, 0),
    doctor: "Dra. Lucia Freitas",
    unit: "Unidade Sul",
    cost: 550.0,
    status: "Confirmado",
  },
  {
    id: "A004",
    patient: "Ana Pereira",
    type: "Ultrassom",
    date: new Date(2024, 4, 23, 14, 15),
    doctor: "Dr. Roberto Castro",
    unit: "Unidade Leste",
    cost: 280.0,
    status: "Confirmado",
  },
  {
    id: "A005",
    patient: "Carlos Ribeiro",
    type: "Raio-X",
    date: new Date(2024, 4, 24, 11, 0),
    doctor: "Dra. Fernanda Lima",
    unit: "Unidade Centro",
    cost: 180.0,
    status: "Confirmado",
  },
  {
    id: "A006",
    patient: "Luiza Martins",
    type: "Eletrocardiograma",
    date: new Date(2024, 4, 25, 15, 30),
    doctor: "Dr. Paulo Vieira",
    unit: "Unidade Norte",
    cost: 220.0,
    status: "Agendado",
  },
  {
    id: "A007",
    patient: "Paulo Costa",
    type: "Coleta de Sangue",
    date: new Date(2024, 4, 19, 9, 0),
    doctor: "Dra. Ana Souza",
    unit: "Unidade Sul",
    cost: 120.0,
    status: "Agendado",
  },
  {
    id: "A008",
    patient: "Mariana Lima",
    type: "Densitometria",
    date: new Date(2024, 4, 20, 13, 45),
    doctor: "Dr. José Santos",
    unit: "Unidade Leste",
    cost: 320.0,
    status: "Agendado",
  },
  {
    id: "A009",
    patient: "Ricardo Alves",
    type: "Tomografia",
    date: new Date(2024, 4, 28, 10, 30),
    doctor: "Dra. Carla Mendes",
    unit: "Unidade Centro",
    cost: 850.0,
    status: "Agendado",
  },
  {
    id: "A010",
    patient: "Camila Ferreira",
    type: "Mamografia",
    date: new Date(2024, 4, 30, 11, 15),
    doctor: "Dr. André Oliveira",
    unit: "Unidade Norte",
    cost: 380.0,
    status: "Agendado",
  },
];

// API Simulation Functions - Ready for backend integration
export const getAppointments = async (): Promise<Appointment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAppointments), 100);
  });
};

export const updateAppointmentStatus = async (appointmentId: string, newStatus: string): Promise<Appointment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const appointment = mockAppointments.find(a => a.id === appointmentId);
      if (appointment) {
        appointment.status = newStatus;
        resolve(appointment);
      }
    }, 100);
  });
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAppointment = {
        ...appointmentData,
        id: `A${String(mockAppointments.length + 1).padStart(3, '0')}`
      };
      mockAppointments.push(newAppointment);
      resolve(newAppointment);
    }, 100);
  });
};
