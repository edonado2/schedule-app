export interface Appointment {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendee: {
    name: string;
    email: string;
    phone?: string;
  };
  creator: string;
  googleCalendarEventId?: string;
  reminderSent: boolean;
  createdAt: string;
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