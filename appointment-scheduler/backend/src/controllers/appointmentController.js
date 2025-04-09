import Appointment from '../models/Appointment.js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      creator: req.user._id
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all appointments for the authenticated user
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ creator: req.user._id })
      .sort({ date: 1, startTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single appointment
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sync appointment with Google Calendar
export const syncWithGoogleCalendar = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      creator: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Initialize Google Calendar API
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set the credentials
    oauth2Client.setCredentials({
      refresh_token: req.user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create Google Calendar event
    const event = {
      summary: appointment.title,
      description: appointment.description,
      start: {
        dateTime: `${appointment.date}T${appointment.startTime}:00`,
        timeZone: 'UTC'
      },
      end: {
        dateTime: `${appointment.date}T${appointment.endTime}:00`,
        timeZone: 'UTC'
      },
      attendees: [
        {
          email: appointment.attendee.email,
          displayName: appointment.attendee.name
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    // Update appointment with Google Calendar event ID
    appointment.googleCalendarEventId = response.data.id;
    await appointment.save();

    res.json({ 
      message: 'Appointment synced with Google Calendar',
      eventId: response.data.id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 