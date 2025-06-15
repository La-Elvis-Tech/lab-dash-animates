
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import AppointmentStats from '@/components/appointments/AppointmentStats';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import AppointmentsTable from '@/components/appointments/AppointmentsTable';
import CreateAppointmentForm from '@/components/appointments/CreateAppointmentForm';
import { adaptSupabaseAppointmentsToAppointments } from '@/utils/appointmentAdapters';

const Orders = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { 
    appointments, 
    loading, 
    updateAppointment,
    refreshAppointments 
  } = useSupabaseAppointments();

  const filteredAppointments = appointments
    ? appointments.filter((appointment) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          appointment.patient_name.toLowerCase().includes(searchTermLower) ||
          (appointment.patient_email && appointment.patient_email.toLowerCase().includes(searchTermLower)) ||
          (appointment.patient_phone && appointment.patient_phone.includes(searchTerm)) ||
          appointment.status.toLowerCase().includes(searchTermLower)
        );
      }).filter((appointment) => {
        return selectedStatus === 'all' || appointment.status === selectedStatus;
      })
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Confirmado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Em andamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Concluído': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleCreateAppointment = () => {
    setShowCreateForm(false);
    refreshAppointments();
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
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
              <option value="Em andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Lista de Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentsTable 
              appointments={adaptSupabaseAppointmentsToAppointments(filteredAppointments)} 
              getStatusColor={getStatusColor}
              onUpdateStatus={handleUpdateStatus}
            />
          </CardContent>
        </Card>

        {showCreateForm && (
          <CreateAppointmentForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateAppointment}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
