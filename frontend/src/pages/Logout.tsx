import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const cerrarSesion = async () => {
      try {
        await fetch('http://localhost:5000/auth/logout', {
          method: 'POST',
          credentials: 'include', // usa cookies/sesión
        });

        // Limpia el token u otros datos locales si usás localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('usuario_id');

        // Redirige al inicio de sesión después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    cerrarSesion();
  }, [navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f2f5" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Cerrando sesión...
          </Typography>
          <CircularProgress color="primary" sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    </Box>
  );
}
