import React, { useState } from 'react';
import { Appointment } from '../types/appointment';

interface AppointmentListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
  onEdit: (appointment: Appointment) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, onDelete, onEdit }) => {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-card">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-medium">No appointments scheduled</p>
        <p className="text-sm">Create your first appointment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
              <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                {new Date(appointment.date).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {appointment.startTime} - {appointment.endTime}
              </div>

              {appointment.description && (
                <p className="text-gray-600 text-sm">{appointment.description}</p>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Attendee Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {appointment.attendeeName}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {appointment.attendeeEmail}
                  </p>
                  {appointment.attendeePhone && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {appointment.attendeePhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => onEdit(appointment)}
                  className="btn btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(appointment.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList; 