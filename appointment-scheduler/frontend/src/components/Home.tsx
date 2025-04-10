import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/api';
import { Appointment } from '../types/appointment';
import { toast } from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog';
import AppointmentList from './AppointmentList';

interface FormData {
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
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendee: {
      name: '',
      email: '',
      phone: '',
    },
  });
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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedDate = new Date(formData.date).toISOString();
      const appointmentData = {
        ...formData,
        date: formattedDate,
      };
      
      await appointmentService.create(appointmentData);
      toast.success('Appointment created successfully');
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        attendee: {
          name: '',
          email: '',
          phone: '',
        },
      });
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to create appointment');
      console.error('Error creating appointment:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('attendee.')) {
      const attendeeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attendee: {
          ...prev.attendee,
          [attendeeField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLinkClick = (path: string) => {
    setActiveLink(path);
    setIsMenuOpen(false);
  };

  const handleEdit = async (appointmentId: string) => {
    if (!appointmentId) return;
    try {
      navigate(`/appointments/${appointmentId}/edit`);
    } catch (error) {
      toast.error('Failed to edit appointment');
    }
  };

  const handleDeleteClick = (appointmentId: string, appointmentTitle: string) => {
    if (!appointmentId) return;
    setDeleteDialog({
      isOpen: true,
      appointmentId,
      appointmentTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.appointmentId) return;

    try {
      await appointmentService.delete(deleteDialog.appointmentId);
      setAppointments(prevAppointments => 
        prevAppointments.filter(appointment => appointment._id !== deleteDialog.appointmentId)
      );
      toast.success('Appointment deleted successfully');
      
      setDeleteDialog({
        isOpen: false,
        appointmentId: null,
        appointmentTitle: '',
      });
    } catch (error) {
      toast.error('Failed to delete appointment');
      console.error('Error deleting appointment:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      appointmentId: null,
      appointmentTitle: '',
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-100 relative overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white/100 transition-all duration-300 transform hover:scale-105"
        >
          <svg
            className={`w-6 h-6 text-indigo-600 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-gradient-to-br from-indigo-50/95 via-white/95 to-indigo-100/95 backdrop-blur-xl transform transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex-1 flex flex-col justify-start items-center space-y-8 mt-16">
            <Link
              to="/"
              onClick={() => handleLinkClick('/')}
              className={`w-full text-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeLink === '/'
                  ? 'text-indigo-600'
                  : 'text-indigo-900 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </div>
            </Link>
            <Link
              to="/appointments"
              onClick={() => handleLinkClick('/appointments')}
              className={`w-full text-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeLink === '/appointments'
                  ? 'text-indigo-600'
                  : 'text-indigo-900 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Appointments</span>
              </div>
            </Link>
            <Link
              to="/calendar"
              onClick={() => handleLinkClick('/calendar')}
              className={`w-full text-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                activeLink === '/calendar'
                  ? 'text-indigo-600'
                  : 'text-indigo-900 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendar</span>
              </div>
            </Link>
          </div>
          <div className="border-t border-indigo-100/50 pt-6">
            <div className="flex items-center justify-center space-x-6">
              <button className="p-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition-all duration-300 transform hover:scale-105">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="p-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition-all duration-300 transform hover:scale-105">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/20 p-6 z-40">
        <div className="flex flex-col h-full">
          <div className="mb-8 flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-indigo-900">Appointments</h2>
          </div>
          <div className="flex-1 flex flex-col space-y-6">
            <Link
              to="/"
              onClick={() => setActiveLink('/')}
              className={`text-lg font-medium transition-all duration-300 ${
                activeLink === '/'
                  ? 'text-indigo-600'
                  : 'text-indigo-900 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </div>
            </Link>
            <Link
              to="/appointments"
              onClick={() => setActiveLink('/appointments')}
              className={`text-lg font-medium transition-all duration-300 ${
                activeLink === '/appointments'
                  ? 'text-indigo-600'
                  : 'text-indigo-900 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Appointments</span>
              </div>
            </Link>
            <Link
              to="/calendar"
              onClick={() => setActiveLink('/calendar')}
              className={`text-lg font-medium transition-all duration-300 ${
                activeLink === '/calendar'
                  ? 'text-indigo-600'
                  : 'text-indigo-900 hover:text-indigo-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendar</span>
              </div>
            </Link>
          </div>
          <div className="border-t border-indigo-100/50 pt-6">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-all duration-300 transform hover:scale-105">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-all duration-300 transform hover:scale-105">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-indigo-900">
              My Appointments
            </h1>
            <p className="mt-2 text-base text-indigo-600/80">
              Schedule and manage your appointments with ease
            </p>
          </div>

          {/* Cards Container */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Create Appointment Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100/50 overflow-hidden">
              <div className="p-6 sm:p-8 w-full max-w-full">
                {/* Card Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-indigo-100/50">
                  <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold text-indigo-900 truncate">Create Appointment</h2>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-indigo-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Meeting with client"
                        className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 placeholder-indigo-300 transition duration-200"
                      />
                    </div>

                    {/* Date & Time Grid */}
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Date */}
                      <div className="w-full">
                        <label htmlFor="date" className="block text-sm font-medium text-indigo-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 transition duration-200"
                        />
                      </div>

                      {/* Time Container */}
                      <div className="grid grid-cols-2 gap-4 w-full">
                        {/* Start Time */}
                        <div>
                          <label htmlFor="startTime" className="block text-sm font-medium text-indigo-700 mb-2">
                            Start
                          </label>
                          <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 transition duration-200"
                          />
                        </div>

                        {/* End Time */}
                        <div>
                          <label htmlFor="endTime" className="block text-sm font-medium text-indigo-700 mb-2">
                            End
                          </label>
                          <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 transition duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-indigo-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Details about the appointment"
                        className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 placeholder-indigo-300 transition duration-200 resize-none"
                      />
                    </div>

                    {/* Attendee Details */}
                    <div className="sm:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Attendee Name */}
                        <div className="w-full">
                          <label htmlFor="attendee.name" className="block text-sm font-medium text-indigo-700 mb-2">
                            Attendee Name
                          </label>
                          <input
                            type="text"
                            id="attendee.name"
                            name="attendee.name"
                            value={formData.attendee.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 placeholder-indigo-300 transition duration-200"
                          />
                        </div>

                        {/* Attendee Email */}
                        <div className="w-full">
                          <label htmlFor="attendee.email" className="block text-sm font-medium text-indigo-700 mb-2">
                            Attendee Email
                          </label>
                          <input
                            type="email"
                            id="attendee.email"
                            name="attendee.email"
                            value={formData.attendee.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 placeholder-indigo-300 transition duration-200"
                          />
                        </div>
                      </div>

                      {/* Attendee Phone */}
                      <div className="w-full">
                        <label htmlFor="attendee.phone" className="block text-sm font-medium text-indigo-700 mb-2">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          id="attendee.phone"
                          name="attendee.phone"
                          value={formData.attendee.phone}
                          onChange={handleChange}
                          placeholder="(123) 456-7890"
                          className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white/50 text-indigo-900 placeholder-indigo-300 transition duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="inline-flex items-center px-8 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create Appointment</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Appointments List Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100/50 overflow-hidden">
              <div className="p-6 sm:p-8 w-full max-w-full flex flex-col">
                {/* Card Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-indigo-100/50">
                  <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold text-indigo-900 truncate">Recent Appointments</h2>
                    <p className="text-sm text-indigo-600/70 mt-1 truncate">View and manage your scheduled appointments</p>
                  </div>
                </div>

                {/* Appointments List with Modern Cards */}
                <div className="mt-6 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="min-h-[400px] max-h-[calc(100vh-16rem)]">
                    <div className="grid grid-cols-1 gap-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-60">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : appointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center">
                          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-indigo-900 mb-2">No appointments yet</h3>
                          <p className="text-indigo-600/70">Create your first appointment to get started</p>
                        </div>
                      ) : (
                        appointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            className="bg-indigo-50/50 backdrop-blur-sm rounded-xl p-4 hover:bg-indigo-50 transition-all duration-200 border border-indigo-100/50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <h3 className="text-lg font-semibold text-indigo-900 truncate">{appointment.title}</h3>
                                </div>
                                
                                <div className="space-y-2">
                                  <p className="text-sm text-indigo-800/90 line-clamp-2">{appointment.description}</p>
                                  
                                  <div className="flex flex-wrap gap-3 text-sm">
                                    <div className="flex items-center text-indigo-700">
                                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(appointment.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-indigo-700">
                                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {appointment.startTime} - {appointment.endTime}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="truncate">{appointment.attendee.name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleEdit(appointment._id)}
                                  className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(appointment._id, appointment.title)}
                                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #eef2ff;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c7d2fe;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a5b4fc;
          }
          
          @media (max-height: 800px) {
            .custom-scrollbar {
              height: 400px !important;
            }
          }
        `
      }} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment "${deleteDialog.appointmentTitle}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Home; 