import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { appointmentService } from '../services/api';
import { Appointment } from '../types/appointment';
import { toast } from 'react-hot-toast';

interface AppointmentFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  attendee: {
    name: string;
    email: string;
    phone: string;
  };
}

const AppointmentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    attendee: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        if (location.state?.appointment) {
          const appointment = location.state.appointment;
          setFormData({
            title: appointment.title,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            description: appointment.description || '',
            attendee: {
              name: appointment.attendee.name,
              email: appointment.attendee.email,
              phone: appointment.attendee.phone || ''
            }
          });
        } else if (id) {
          const response = await appointmentService.getById(id);
          const appointment = response.data;
          setFormData({
            title: appointment.title,
            date: new Date(appointment.date).toISOString().split('T')[0],
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            description: appointment.description || '',
            attendee: {
              name: appointment.attendee.name,
              email: appointment.attendee.email,
              phone: appointment.attendee.phone || ''
            }
          });
        }
      } catch (err) {
        setError('Failed to load appointment data');
        console.error('Error loading appointment:', err);
      }
    };

    initializeForm();
  }, [id, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('attendee.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attendee: {
          ...prev.attendee,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description || '',
        attendee: {
          name: formData.attendee.name,
          email: formData.attendee.email,
          phone: formData.attendee.phone || ''
        }
      };

      if (id) {
        await appointmentService.update(id, formattedData);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentService.create(formattedData);
        toast.success('Appointment created successfully');
      }
      navigate('/appointments');
    } catch (err) {
      setError('Failed to save appointment');
      toast.error('Failed to save appointment');
      console.error('Error saving appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {id ? 'Edit Appointment' : 'Create New Appointment'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-w-[200px]"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-w-[200px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Attendee Information</h4>
              <div>
                <label htmlFor="attendee.name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="attendee.name"
                  id="attendee.name"
                  required
                  value={formData.attendee.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="attendee.email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="attendee.email"
                  id="attendee.email"
                  required
                  value={formData.attendee.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="attendee.phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="attendee.phone"
                  id="attendee.phone"
                  value={formData.attendee.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Saving...' : id ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm; 