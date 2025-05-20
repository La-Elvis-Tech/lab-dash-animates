
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
