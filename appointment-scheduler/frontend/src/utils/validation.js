export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateAppointment = (appointment) => {
  const errors = {};

  if (!appointment.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!appointment.date) {
    errors.date = 'Date is required';
  }

  if (!appointment.startTime) {
    errors.startTime = 'Start time is required';
  }

  if (!appointment.endTime) {
    errors.endTime = 'End time is required';
  }

  if (!appointment.attendee?.name?.trim()) {
    errors.attendee = { ...errors.attendee, name: 'Attendee name is required' };
  }

  if (!appointment.attendee?.email) {
    errors.attendee = { ...errors.attendee, email: 'Email is required' };
  } else if (!validateEmail(appointment.attendee.email)) {
    errors.attendee = { ...errors.attendee, email: 'Invalid email format' };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 