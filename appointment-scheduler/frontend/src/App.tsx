import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppointmentList from './components/AppointmentList';
import AppointmentForm from './components/AppointmentForm';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import { Appointment } from './types/appointment';
import { appointmentService } from './services/api';

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAll();
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await appointmentService.delete(id);
      setAppointments(appointments.filter(app => app.id !== id));
    } catch (err) {
      setError('Failed to delete appointment');
      console.error('Error deleting appointment:', err);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    // Navigation to edit form is handled by the AppointmentList component
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  Appointment Scheduler
                </Link>
              </div>
              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/appointments"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/appointments/new"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    New Appointment
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {localStorage.getItem('userName')?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </button>
                  </div>
                  {showProfileMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/appointments"
            element={
              isAuthenticated ? (
                <AppointmentList
                  appointments={appointments}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/appointments/new"
            element={isAuthenticated ? <AppointmentForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/appointments/:id/edit"
            element={isAuthenticated ? <AppointmentForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/appointments/:id"
            element={isAuthenticated ? <AppointmentForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App; 