import { useEffect, useState, } from 'react';
import { Box, Typography, Container, Button, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/profile', {
        });
        if (!res.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
        setProfile({ error: 'No se pudo cargar el perfil' });
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
        return  (
          <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Cargando perfil...</Typography>
          </Container>
        )
      }

  if (profile.error) return <div>{profile.error}</div>;

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Mi Perfil de Usuario
          </Typography>
          <Typography variant="body1">
            Nombre: {profile.nombre ?? "No disponible"}
          </Typography>
          <Typography variant="body1">
            Apellido: {profile.apellido ?? "No disponible"}
          </Typography>
          <Typography variant="body1">
            Email: {profile.email ?? "No disponible"}
          </Typography>
          <Typography variant="body1">
            DNI: {profile.dni ?? "No disponible"}
          </Typography>
          <Typography variant="body1">
            Teléfono: {profile.telefono ?? "No disponible"}
          </Typography>
          <Typography variant="body1">
            Fecha de nacimiento: {profile.fecha_nacimiento ?? "No disponible"}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <Button variant="contained" color="primary" sx={{ px: 3, py: 1.5, fontWeight: 'bold', width: '140px'}}
                    component={RouterLink}
                    to="/edit-profile"
              >
                Editar Perfil
            </Button >
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
                to="/"
                sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
              >
              Volver
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default ProfilePage;