import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Appointment } from '../types/appointment';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { appointmentService } from '../services/api';
import { toast } from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog';

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  onAppointmentsChange?: (appointments: Appointment[]) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments: initialAppointments,
  loading,
  onAppointmentsChange,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isLoading, setIsLoading] = useState(loading);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    appointmentId: string | null;
    appointmentTitle: string;
  }>({
    isOpen: false,
    appointmentId: null,
    appointmentTitle: '',
  });

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const handleEdit = async (appointmentId: string) => {
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }

    try {
      const response = await appointmentService.getById(appointmentId);
      if (onEdit) {
        onEdit(response.data);
      }
      navigate(`/appointments/${appointmentId}/edit`, { state: { appointment: response.data } });
    } catch (error) {
      toast.error('Failed to edit appointment');
      console.error('Error editing appointment:', error);
    }
  };

  const handleDeleteClick = (appointmentId: string, appointmentTitle: string) => {
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }

    setDeleteDialog({
      isOpen: true,
      appointmentId,
      appointmentTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }

    try {
      setIsLoading(true);
      
      if (onDelete) {
        await onDelete(deleteDialog.appointmentId);
      } else {
        await appointmentService.delete(deleteDialog.appointmentId);
      }
      
      const updatedAppointments = appointments.filter(
        appointment => appointment._id !== deleteDialog.appointmentId
      );
      setAppointments(updatedAppointments);
      
      if (onAppointmentsChange) {
        onAppointmentsChange(updatedAppointments);
      }
      
      toast.success('Appointment deleted successfully');
      
      setDeleteDialog({
        isOpen: false,
        appointmentId: null,
        appointmentTitle: '',
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      appointmentId: null,
      appointmentTitle: '',
    });
  };

  const getAppointmentStatus = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    if (isThisWeek(appointmentDate)) return 'This Week';
    return format(appointmentDate, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">My Appointments</h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-600">
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} scheduled
            </p>
          </div>
          <div className="flex space-x-3 sm:space-x-4">
            <Link
              to="/appointments/new"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Appointment
            </Link>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2 sm:mb-3">No appointments scheduled</h3>
            <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6">Get started by creating your first appointment</p>
            <Link
              to="/appointments/new"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Schedule Appointment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                    <div className="mb-3 sm:mb-0">
                      <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">{appointment.title}</h2>
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-50 text-indigo-700 mt-2 sm:mt-3">
                        {getAppointmentStatus(appointment.date)}
                      </span>
                    </div>
                    <div className="flex space-x-3 self-end sm:self-auto">
                      <button
                        onClick={() => handleEdit(appointment._id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-200"
                        title="Edit"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(appointment._id, appointment.title)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center text-slate-600">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-base sm:text-lg">
                        {format(new Date(`2000-01-01T${appointment.startTime}`), 'h:mm a')} -{' '}
                        {format(new Date(`2000-01-01T${appointment.endTime}`), 'h:mm a')}
                      </span>
                    </div>

                    {appointment.description && (
                      <div className="text-slate-600">
                        <p className="line-clamp-2 text-base sm:text-lg">{appointment.description}</p>
                      </div>
                    )}

                    <div className="pt-4 sm:pt-6 border-t border-slate-100">
                      <h3 className="text-sm font-medium text-slate-500 mb-2 sm:mb-3">Attendee</h3>
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-3 sm:mr-4">
                          <span className="text-indigo-600 font-medium text-base sm:text-lg">
                            {appointment.attendee.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-base sm:text-lg font-medium text-slate-800">{appointment.attendee.name}</p>
                          <p className="text-sm text-slate-500">{appointment.attendee.email}</p>
                          {appointment.attendee.phone && (
                            <p className="text-sm text-slate-500">{appointment.attendee.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Appointment"
          message={`Are you sure you want to delete the appointment "${deleteDialog.appointmentTitle}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default AppointmentList; 