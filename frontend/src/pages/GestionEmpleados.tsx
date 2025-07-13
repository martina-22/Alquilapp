import { Box, Button, Card, CardContent, Typography, Stack} from '@mui/material';
import { useNavigate} from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
export default function GestionEmpleados() {
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
              Gestión de Empleados
            </Typography>
          </Box>

      

          <Stack spacing={3} mt={4}>
            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/RegistrarEmpleadoForm')}>
              Registrar Empleado
            </Button>

            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/ListadoEmpleadosActivos')}>
              Ver listado de empleados
            </Button>

            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/AltaEmpleado')}>
              Recuperar empleado eliminado
            </Button>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}