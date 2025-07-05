import { Box, Button, Card, CardContent, Typography, Stack} from '@mui/material';
import { useNavigate} from 'react-router-dom';

export default function GestionSucursales() {
  const navigate = useNavigate();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f4f4" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" align="center" color="secondary" fontWeight="bold" gutterBottom>
            Gestión de Sucursales
          </Typography>

          <Stack spacing={3} mt={4}>
            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/CrearSucursal')}>
              Crear Sucursal
            </Button>

            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/ListadoSucursales')}>
              Listado de Sucursales
            </Button>

            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/AltaSucursal')}>
              Recuperar Sucursal Eliminada
            </Button>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
