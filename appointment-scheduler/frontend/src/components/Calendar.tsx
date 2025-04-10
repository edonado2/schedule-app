import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Appointment } from '../types/appointment';
import { format as formatTime } from 'date-fns';

interface CalendarProps {
  appointments?: Appointment[];
}

const Calendar: React.FC<CalendarProps> = ({ appointments = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const hasAppointments = appointments.some(appointment => 
      isSameDay(new Date(appointment.date), day)
    );
    if (hasAppointments) {
      setShowAppointmentsModal(true);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-white py-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day) => {
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const dayAppointments = getAppointmentsForDate(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={`relative h-24 bg-white p-2 text-left hover:bg-indigo-50 ${
                isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                  isToday(day)
                    ? 'bg-indigo-600 text-white'
                    : isSelected
                    ? 'text-indigo-600'
                    : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </span>
              
              {/* Appointment Indicators */}
              {dayAppointments.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment._id}
                      className="text-xs bg-indigo-100 text-indigo-700 rounded px-1 py-0.5 truncate"
                    >
                      {formatTime(new Date(`2000-01-01T${appointment.startTime}`), 'h:mm a')} - {appointment.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-indigo-600">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Appointments Modal */}
      {showAppointmentsModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Appointments for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500">No appointments scheduled</p>
              ) : (
                <div className="space-y-4">
                  {getAppointmentsForDate(selectedDate).map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                          <p className="text-sm text-gray-500">
                            {formatTime(new Date(`2000-01-01T${appointment.startTime}`), 'h:mm a')} -{' '}
                            {formatTime(new Date(`2000-01-01T${appointment.endTime}`), 'h:mm a')}
                          </p>
                        </div>
                        <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-1">
                          {appointment.attendee.name}
                        </span>
                      </div>
                      {appointment.description && (
                        <p className="mt-2 text-sm text-gray-600">{appointment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowAppointmentsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 