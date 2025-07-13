import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  const handleVolver = () => {
    const rol = localStorage.getItem('rol');

    if (rol === '1') {
      navigate('/HomeAdmin');
    } else if (rol === '2') {
      navigate('/HomeEmpleado');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('http://localhost:5000/auth/profile');
        if (!res.ok) throw new Error('Error en la respuesta del servidor');

        const data = await res.json();
        console.log('📦 Datos recibidos:', data);
        setProfile(data);
      } catch (error) {
        console.error(error);
        setProfile({ error: 'No se pudo cargar el perfil' });
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando perfil...</Typography>
      </Container>
    );
  }

  if (profile.error) return <div>{profile.error}</div>;

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Mi Perfil de Usuario
          </Typography>
          <Typography variant="body1">Nombre: {profile.nombre ?? "No disponible"}</Typography>
          <Typography variant="body1">Apellido: {profile.apellido ?? "No disponible"}</Typography>
          <Typography variant="body1">Email: {profile.email ?? "No disponible"}</Typography>
          <Typography variant="body1">DNI: {profile.dni ?? "No disponible"}</Typography>
          <Typography variant="body1">Teléfono: {profile.telefono ?? "No disponible"}</Typography>
          <Typography variant="body1">Fecha de nacimiento: {profile.fecha_nacimiento ?? "No disponible"}</Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                width: '140px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              component={RouterLink}
              to="/edit-profile"
            >
              Editar Perfil
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleVolver}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                width: '140px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              Volver
            </Button>

            {Number(profile?.rol) === 3 && (
              <Button
                variant="contained"
                color="error"
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  width: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onClick={async () => {
                  console.log("🧨 Se hizo clic en Borrar cuenta");

                  if (!profile?.id) {
                    console.error("❌ ID de usuario no definido");
                    return;
                  }

                  const confirmacion = window.confirm("¿Estás seguro de que querés borrar tu cuenta?");
                  if (!confirmacion) return;

                  try {
                    const res = await authFetch(`http://localhost:5000/usuarios/${profile.id}`, {
                      method: 'DELETE',
                    });

                    const data = await res.json();

                    if (res.ok) {
                      localStorage.removeItem('token');
                      localStorage.removeItem('rol');
                      window.location.href = '/';
                    } else {
                      alert(data?.error || "Error al desactivar la cuenta");
                    }
                  } catch (error) {
                    console.error("💥 Error al borrar la cuenta:", error);
                    alert("Error de red al intentar borrar la cuenta");
                  }
                }}
              >
                Borrar cuenta
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default ProfilePage;
