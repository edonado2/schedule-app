import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext';
import { format } from 'date-fns';

const Dashboard = () => {
  const { appointments, loading, error } = useAppointments();
  const navigate = useNavigate();

  // Filter and sort upcoming appointments
  const upcomingAppointments = appointments
    .filter(appointment => new Date(`${appointment.date}T${appointment.startTime}`) >= new Date())
    .sort((a, b) => 
      new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`)
    )
    .slice(0, 5); // Show only next 5 appointments

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => navigate('/appointments/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            New Appointment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.title}</h3>
                      <p className="text-gray-600">
                        {format(new Date(appointment.date), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-gray-600">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                      <p className="text-gray-600">
                        With: {appointment.attendee.name}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/appointments')}
            className="text-blue-500 hover:text-blue-600"
          >
            View All Appointments →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 