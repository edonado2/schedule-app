export interface Appointment {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  attendee: {
    name: string;
    email: string;
    phone?: string;
  };
  creator: string;
  googleEventId?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFormData {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
} 