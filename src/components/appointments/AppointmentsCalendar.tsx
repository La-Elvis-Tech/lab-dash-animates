
import React from 'react';
import { Calendar } from "@/components/ui/calendar";

interface AppointmentsCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setIsCalendarOpen: (isOpen: boolean) => void;
  appointmentDates: Date[];
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  selectedDate,
  setSelectedDate,
  setIsCalendarOpen,
  appointmentDates,
}) => {
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        setSelectedDate(date);
        setIsCalendarOpen(false);
      }}
      modifiers={{
        hasAppointment: appointmentDates,
      }}
      modifiersStyles={{
        hasAppointment: {
          color: 'red',
          fontWeight: 'bold',
        }
      }}
      className="pointer-events-auto"
    />
  );
};

export default AppointmentsCalendar;
