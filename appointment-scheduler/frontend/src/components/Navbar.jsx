import { AppBar, Toolbar, Typography, Button, IconButton, Box, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { isAuthenticated, logout } = useAuth();
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <CalendarMonthIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            Appointment Scheduler
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            color="inherit"
            sx={{
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
              },
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/appointments/new"
                variant="contained"
                color="primary"
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
              <Button
                onClick={logout}
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                color="inherit"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
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
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 