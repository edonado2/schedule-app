import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  attendee: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  googleCalendarEventId: {
    type: String,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
appointmentSchema.index({ date: 1, startTime: 1 });
appointmentSchema.index({ 'attendee.email': 1 });
appointmentSchema.index({ creator: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 