
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AppointmentsStats from '@/components/appointments/AppointmentsStats';
import AppointmentsTabs from '@/components/appointments/AppointmentsTabs';
import CreateAppointmentForm from '@/components/appointments/CreateAppointmentForm';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';

const Orders = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { appointments, loading, refreshAppointments } = useSupabaseAppointments();

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refreshAppointments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Agendamentos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie todos os agendamentos de exames
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-lab-blue hover:bg-lab-blue/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <AppointmentsStats appointments={appointments} />
      
      <AppointmentsTabs 
        appointments={appointments}
        loading={loading}
        onAppointmentUpdate={refreshAppointments}
      />

      {showCreateForm && (
        <CreateAppointmentForm 
          onSuccess={handleCreateSuccess}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default Orders;
