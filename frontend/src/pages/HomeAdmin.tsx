import { Box, Button, Grid, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomeAdmin() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/logout');
  };

  const opciones = [
    { label: 'Gestionar Flota', ruta: '/GestionFlota' },
    { label: 'Gestionar Empleados', ruta: '/GestionEmpleados' },
    { label: 'Gestionar Sucursales', ruta: '/GestionSucursales' },
    { label: 'Ver Informes', ruta: '/reportes' },
    { label: 'Ver reporte semanal', ruta: '/reporte_semanal' }
  ];

  return (
    <Box minHeight="100vh" bgcolor="#f4f4f4">
      {/* BANNER SUPERIOR CON FONDO BLANCO */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={2}
        sx={{ backgroundColor: 'white', boxShadow: '0px 1px 4px rgba(0,0,0,0.05)' }}
      >
        {/* LOGO */}
        <Box
          component="img"
          src="src/assets/logo.png"
          alt="AlquilApp Car"
          sx={{ height: { xs: 80, md: 100 } }}
        />

        {/* BOTONES DE PERFIL Y CERRAR SESIÓN */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/profile')}
            sx={{
              borderColor: '#5C33CF',
              color: '#5C33CF',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3
            }}
          >
            Ver perfil
          </Button>
          <Button
            variant="outlined"
            onClick={cerrarSesion}
            sx={{
              borderColor: '#5C33CF',
              color: '#5C33CF',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3
            }}
          >
            Cerrar sesión
          </Button>
        </Stack>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Box px={4} py={5}>
        <Typography variant="h4" align="center" color="secondary" fontWeight="bold" mb={5}>
          Panel de Administración
        </Typography>

        <Grid container spacing={3} justifyContent="center" maxWidth={1000} mx="auto">
          {opciones.map((opcion, i) => (
            <Grid item xs={12} sm={10} md={8} key={i}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate(opcion.ruta)}
                sx={{
                  width: '100%',
                  height: 90,
                  borderRadius: 3,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: 3,
                  letterSpacing: '0.5px'
                }}
              >
                {opcion.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}