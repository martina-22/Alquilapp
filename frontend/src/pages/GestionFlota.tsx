import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

export default function GestionFlota() {
  const navigate = useNavigate();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f4f4" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Box position="relative" mb={3}>
            <IconButton
              onClick={() => navigate('/')}
              color="secondary"
              sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" align="center" color="secondary" fontWeight="bold">
              Gestión de Flota
            </Typography>
          </Box>


          <Stack spacing={3} mt={4}>
            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/crear-vehiculo')}>
              Crear Vehículo
            </Button>

            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/ver-flota')}>
              Ver Listado de Flota
            </Button>

            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/AltaVehiculo')}>
              Recuperar vehiculo Eliminado
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}