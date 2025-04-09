import React, { createContext, useContext, useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments on mount and when the component updates
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const createAppointment = async (appointmentData) => {
    try {
      const newAppointment = await appointmentService.createAppointment(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      throw err;
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, appointmentData);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id ? updatedAppointment : appointment
        )
      );
      return updatedAppointment;
    } catch (err) {
      throw err;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(prev => prev.filter(appointment => appointment._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const value = {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}; 