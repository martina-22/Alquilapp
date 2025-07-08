import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Snackbar, Alert,
  MenuItem, FormControl, InputLabel, Select, CircularProgress
} from '@mui/material';

interface Sucursal {
  id: string;
  nombre: string;
}

export default function RecuperarSucursal() {
  const [sucursalesInactivas, setSucursalesInactivas] = useState<Sucursal[]>([]);
  const [sucursalId, setSucursalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
    fetch('http://localhost:5000/sucursales/inactivas')
        .then(res => res.json())
        .then(data => {
        setSucursalesInactivas(data);
        setLoading(false);
        })
        .catch(() => {
        setMensaje('Error al cargar las sucursales inactivas');
        setEsError(true);
        setOpenSnackbar(true);
        setLoading(false);
        });
    }, []);


  const handleRecuperar = async () => {
    const token = localStorage.getItem('token');
    if (!token || !sucursalId) return;

    try {
      const res = await fetch(`http://localhost:5000/sucursales/recuperar/${sucursalId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setMensaje(data.mensaje || (res.ok ? 'Sucursal reactivada' : 'Error al reactivar'));
      setEsError(!res.ok);
      setOpenSnackbar(true);

      if (res.ok) {
        setSucursalesInactivas(prev => prev.filter(s => s.id !== sucursalId));
        setSucursalId('');
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
          <Typography variant="h5" align="center" fontWeight="bold" color="secondary" gutterBottom>
            Recuperar Sucursal
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : sucursalesInactivas.length === 0 ? (
            <Typography mt={4} align="center" color="textSecondary">
              No hay sucursales inactivas para recuperar.
            </Typography>
          ) : (
            <>
              <FormControl fullWidth sx={{ mt: 4 }}>
                <InputLabel>Sucursal inactiva</InputLabel>
                <Select
                  value={sucursalId}
                  label="Sucursal inactiva"
                  onChange={(e) => setSucursalId(e.target.value)}
                >
                  {sucursalesInactivas.map((sucursal) => (
                    <MenuItem key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 4 }}
                disabled={!sucursalId}
                onClick={handleRecuperar}
              >
                Reactivar Sucursal
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
