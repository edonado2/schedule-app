import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments');
      setLoading(false);
      toast.error('Failed to fetch appointments');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/appointments/${selectedAppointment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.filter((app) => app._id !== selectedAppointment._id));
      setDeleteDialogOpen(false);
      toast.success('Appointment deleted successfully');
    } catch (err) {
      toast.error('Failed to delete appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          My Appointments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CalendarIcon />}
          href="/appointments/new"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          New Appointment
        </Button>
      </Box>

      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item xs={12} sm={6} md={4} key={appointment._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {appointment.title}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    {format(new Date(appointment.date), 'MMMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.startTime} - {appointment.endTime}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {appointment.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Attendee
                  </Typography>
                  <Typography variant="body2">
                    {appointment.attendee.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.attendee.email}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    href={`/appointments/${appointment._id}/edit`}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light,
                        color: 'white',
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setDeleteDialogOpen(true);
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.error.light,
                        color: 'white',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentList; 