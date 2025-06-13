
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Stethoscope, DollarSign, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment, type Appointment } from '@/data/appointments';
import { useToast } from "@/hooks/use-toast";

interface CreateAppointmentFormProps {
  onAppointmentCreated: (appointment: Appointment) => void;
}

const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({ onAppointmentCreated }) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    type: '',
    date: '',
    time: '',
    doctor: '',
    unit: '',
    cost: 0
  });

  const appointmentTypes = [
    'Coleta de Sangue',
    'Ultrassom',
    'Raio-X',
    'Eletrocardiograma',
    'Tomografia',
    'Mamografia',
    'Colonoscopia',
    'Densitometria',
    'Entrega de Resultado'
  ];

  const units = [
    'Unidade Centro',
    'Unidade Norte',
    'Unidade Sul',
    'Unidade Leste',
    'Unidade Oeste'
  ];

  const doctors = [
    'Dra. Ana Souza',
    'Dr. Carlos Mendes',
    'Dra. Lucia Freitas',
    'Dr. Roberto Castro',
    'Dra. Fernanda Lima',
    'Dr. Paulo Vieira',
    'Dr. José Santos',
    'Dra. Carla Mendes',
    'Dr. André Oliveira'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);
      
      const newAppointment = await createAppointment({
        patient: formData.patient,
        type: formData.type,
        date: appointmentDate,
        doctor: formData.doctor,
        unit: formData.unit,
        cost: formData.cost,
        status: 'Agendado'
      });

      onAppointmentCreated(newAppointment);
      
      // Reset form
      setFormData({
        patient: '',
        type: '',
        date: '',
        time: '',
        doctor: '',
        unit: '',
        cost: 0
      });

      toast({
        title: "Agendamento criado com sucesso!",
        description: `Agendamento para ${formData.patient} foi criado.`,
      });

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-neutral-900 dark:text-neutral-100">
          <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Criar Novo Agendamento
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          Preencha as informações para criar um novo agendamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Paciente */}
            <div className="space-y-2">
              <Label htmlFor="patient" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <User className="h-4 w-4" />
                Paciente
              </Label>
              <Input
                id="patient"
                value={formData.patient}
                onChange={(e) => handleInputChange('patient', e.target.value)}
                placeholder="Nome do paciente"
                required
                className="border-neutral-200 dark:border-neutral-700"
              />
            </div>

            {/* Tipo de exame */}
            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Stethoscope className="h-4 w-4" />
                Tipo de Exame
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Calendar className="h-4 w-4" />
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                className="border-neutral-200 dark:border-neutral-700"
              />
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Clock className="h-4 w-4" />
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
                className="border-neutral-200 dark:border-neutral-700"
              />
            </div>

            {/* Médico */}
            <div className="space-y-2">
              <Label htmlFor="doctor" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <User className="h-4 w-4" />
                Médico
              </Label>
              <Select value={formData.doctor} onValueChange={(value) => handleInputChange('doctor', value)}>
                <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>
                      {doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <MapPin className="h-4 w-4" />
                Unidade
              </Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custo */}
            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <DollarSign className="h-4 w-4" />
                Custo (R$)
              </Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
                className="border-neutral-200 dark:border-neutral-700"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agendamento
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAppointmentForm;
