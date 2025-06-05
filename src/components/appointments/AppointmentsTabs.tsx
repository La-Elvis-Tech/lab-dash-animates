
import React from 'react';
import { format } from 'date-fns';
import { Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentsTable from './AppointmentsTable';
import UnitsTable from './UnitsTable';
import { Appointment, UnitSummary } from '@/types/appointment';

interface AppointmentsTabsProps {
  recentAppointments: Appointment[];
  next7DaysAppointments: Appointment[];
  restOfMonthAppointments: Appointment[];
  selectedDate: Date | undefined;
  selectedDateAppointments: Appointment[];
  unitsList: UnitSummary[];
  today: Date;
  sevenDaysFromNow: Date;
  endOfCurrentMonth: Date;
  getStatusColor: (status: string) => string;
  onUpdateStatus?: (appointmentId: string, newStatus: string) => void;
}

const AppointmentsTabs: React.FC<AppointmentsTabsProps> = ({
  recentAppointments,
  next7DaysAppointments,
  restOfMonthAppointments,
  selectedDate,
  selectedDateAppointments,
  unitsList,
  today,
  sevenDaysFromNow,
  endOfCurrentMonth,
  getStatusColor,
  onUpdateStatus,
}) => {
  return (
    <Tabs defaultValue="next7days">
      <TabsList className="mb-4 bg-gradient-to-r from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 dark:border-none">
        <TabsTrigger value="recent">Recentes</TabsTrigger>
        <TabsTrigger value="next7days">Próximos 7 dias</TabsTrigger>
        <TabsTrigger value="restOfMonth">Resto do mês</TabsTrigger>
        <TabsTrigger value="units">
          <Building className="h-4 w-4 mr-1" />
          Unidades
        </TabsTrigger>
        {selectedDate && (
          <TabsTrigger value="selectedDate">
            {format(selectedDate, "dd/MM/yyyy")}
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="recent" className="mt-0">
        <h3 className="text-lg font-medium mb-4">Agendamentos recentes</h3>
        <AppointmentsTable 
          appointments={recentAppointments} 
          getStatusColor={getStatusColor}
          onUpdateStatus={onUpdateStatus}
        />
      </TabsContent>
      
      <TabsContent value="next7days" className="mt-0">
        <h3 className="text-lg font-medium mb-4">
          Próximos 7 dias ({format(today, "dd/MM")} - {format(sevenDaysFromNow, "dd/MM")})
        </h3>
        <AppointmentsTable 
          appointments={next7DaysAppointments} 
          getStatusColor={getStatusColor}
          onUpdateStatus={onUpdateStatus}
        />
      </TabsContent>
      
      <TabsContent value="restOfMonth" className="mt-0">
        <h3 className="text-lg font-medium mb-4">
          Resto do mês ({format(new Date(sevenDaysFromNow.getTime() + 86400000), "dd/MM")} - {format(endOfCurrentMonth, "dd/MM")})
        </h3>
        <AppointmentsTable 
          appointments={restOfMonthAppointments} 
          getStatusColor={getStatusColor}
          onUpdateStatus={onUpdateStatus}
        />
      </TabsContent>

      <TabsContent value="units" className="mt-0">
        <h3 className="text-lg font-medium mb-4">
          Unidades e seus agendamentos
        </h3>
        <UnitsTable units={unitsList} />
      </TabsContent>
      
      {selectedDate && (
        <TabsContent value="selectedDate" className="mt-0">
          <h3 className="text-lg font-medium mb-4">
            Agendamentos em {format(selectedDate, "dd/MM/yyyy")}
          </h3>
          <AppointmentsTable 
            appointments={selectedDateAppointments} 
            getStatusColor={getStatusColor}
            onUpdateStatus={onUpdateStatus}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default AppointmentsTabs;
