
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Plus } from 'lucide-react';
import AppointmentCalendar from './AppointmentCalendar';
import CreateAppointmentForm from './CreateAppointmentForm';
import DoctorManagement from './DoctorManagement';
import ExamTypeManagement from './ExamTypeManagement';
import AppointmentsStats from './AppointmentsStats';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';

const AppointmentsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { 
    appointments, 
    examTypes, 
    doctors, 
    units, 
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    createExamType,
    updateExamType,
    deleteExamType,
    refreshAppointments,
  } = useSupabaseAppointments();

  const handleSelectAppointment = (appointment: any) => {
    console.log('Selected appointment:', appointment);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    console.log('Selected slot:', slotInfo);
    setShowCreateForm(true);
  };

  const handleCreateAppointment = async () => {
    setShowCreateForm(false);
    await refreshAppointments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">Carregando sistema de agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Sistema de Agendamentos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie agendamentos, médicos e tipos de exames
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <AppointmentsStats appointments={appointments} />

      {showCreateForm && (
        <CreateAppointmentForm 
          onAppointmentCreated={handleCreateAppointment}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <TabsTrigger 
            value="calendar"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger 
            value="doctors"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Médicos ({doctors.length})
          </TabsTrigger>
          <TabsTrigger 
            value="exam-types"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4 mr-2" />
            Tipos de Exames ({examTypes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <AppointmentCalendar
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
            onSelectSlot={handleSelectSlot}
          />
        </TabsContent>

        <TabsContent value="doctors">
          <DoctorManagement
            doctors={doctors}
            units={units}
            onCreateDoctor={createDoctor}
            onUpdateDoctor={updateDoctor}
            onDeleteDoctor={deleteDoctor}
          />
        </TabsContent>

        <TabsContent value="exam-types">
          <ExamTypeManagement
            examTypes={examTypes}
            onCreateExamType={createExamType}
            onUpdateExamType={updateExamType}
            onDeleteExamType={deleteExamType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsDashboard;
