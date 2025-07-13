import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Snackbar, Alert,
  MenuItem, FormControl, InputLabel, Select, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

interface Vehiculo {
  id: string;
  patente: string;
}

export default function RecuperarVehiculo() {
  const navigate = useNavigate();
  const [vehiculosInactivos, setVehiculosInactivos] = useState<Vehiculo[]>([]);
  const [patente, setPatente] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/vehiculos/inactivos')
      .then(res => res.json())
      .then(data => {
        setVehiculosInactivos(data.vehiculos || []);
        setLoading(false);
      })
      .catch(() => {
        setMensaje('Error al cargar los vehículos inactivos');
        setEsError(true);
        setOpenSnackbar(true);
        setLoading(false);
      });
  }, []);

  const handleRecuperar = async () => {
    const token = localStorage.getItem('token');
    if (!token || !patente) return;

    try {
      const res = await fetch(`http://localhost:5000/vehiculos/recuperar/${patente}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setMensaje(data.message || (res.ok ? 'Vehículo reactivado correctamente' : 'Error al reactivar'));
      setEsError(!res.ok);
      setOpenSnackbar(true);

      if (res.ok) {
        setVehiculosInactivos(prev => prev.filter(v => v.patente !== patente));
        setPatente('');
      }
    } catch {
      setMensaje('Error de conexión');
      setEsError(true);
      setOpenSnackbar(true);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f4f4" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Box position="relative" mb={3}>
            <IconButton
              onClick={() => navigate('/GestionFlota')}
              color="secondary"
              sx={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" align="center" fontWeight="bold" color="secondary">
              Recuperar Vehículo
            </Typography>
          </Box>


          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : vehiculosInactivos.length === 0 ? (
            <Typography mt={4} align="center" color="textSecondary">
              No hay vehículos inactivos para recuperar.
            </Typography>
          ) : (
            <>
              <FormControl fullWidth sx={{ mt: 4 }}>
                <InputLabel>Vehículo inactivo</InputLabel>
                <Select
                  value={patente}
                  label="Vehículo inactivo"
                  onChange={(e) => setPatente(e.target.value)}
                >
                  {vehiculosInactivos.map((vehiculo) => (
                    <MenuItem key={vehiculo.id} value={vehiculo.patente}>
                      {vehiculo.patente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 4 }}
                disabled={!patente}
                onClick={handleRecuperar}
              >
                Reactivar Vehículo
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={esError ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}