import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  syncWithGoogleCalendar
} from '../controllers/appointmentController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Appointment routes
router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.post('/sync-google', syncWithGoogleCalendar);

export default router; 