import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Search, Filter, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AppointmentsTabs } from '@/components/appointments/AppointmentsTabs';
import { CreateAppointmentForm } from '@/components/appointments/CreateAppointmentForm';
import { AppointmentStats } from '@/components/appointments/AppointmentStats';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Orders = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { appointments, loading, error, refetch } = useSupabaseAppointments();

  const filteredAppointments = appointments
    ? appointments.filter((appointment) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          appointment.patient_name.toLowerCase().includes(searchTermLower) ||
          appointment.patient_email.toLowerCase().includes(searchTermLower) ||
          appointment.patient_phone.includes(searchTerm) ||
          appointment.status.toLowerCase().includes(searchTermLower)
        );
      }).filter((appointment) => {
        return selectedStatus === 'all' || appointment.status === selectedStatus;
      })
    : [];

  const totalAppointments = appointments ? appointments.length : 0;
  const scheduledAppointments = appointments ? appointments.filter(appointment => appointment.status === 'Agendado').length : 0;
  const confirmedAppointments = appointments ? appointments.filter(appointment => appointment.status === 'Confirmado').length : 0;
  const completedAppointments = appointments ? appointments.filter(appointment => appointment.status === 'Concluído').length : 0;
  const canceledAppointments = appointments ? appointments.filter(appointment => appointment.status === 'Cancelado').length : 0;
  const inProgressAppointments = appointments ? appointments.filter(appointment => appointment.status === 'Em Andamento').length : 0;

  const handleCreateAppointment = () => {
    setShowCreateForm(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Agendamentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todos os agendamentos de exames
            </p>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AppointmentStats appointments={appointments} />

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome do paciente, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="Agendado">Agendado</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <AppointmentsTabs 
          appointments={filteredAppointments} 
          loading={loading}
          onAppointmentUpdate={refetch}
        />

        {showCreateForm && (
          <CreateAppointmentForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateAppointment}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
