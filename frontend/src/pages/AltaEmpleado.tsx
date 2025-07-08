import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, MenuItem, Select, InputLabel,
  FormControl, Alert, CircularProgress
} from '@mui/material';

export default function DarAltaEmpleado() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/usuarios/empleados/inactivos')
      .then(res => res.json())
      .then(data => {
        setEmpleados(data);
        setLoading(false);
      })
      .catch(() => {
        setEmpleados([]);
        setLoading(false);
      });
  }, []);

  const darAlta = async () => {
    setMensaje('');
    setEsError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/usuarios/empleados/${seleccionado}/alta`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setEsError(true);
        setMensaje(data.message || 'Error');
      } else {
        setMensaje(data.message || 'Empleado reactivado');
        setEmpleados(prev => prev.filter(e => e.id !== parseInt(seleccionado)));
        setSeleccionado('');
      }
    } catch {
      setEsError(true);
      setMensaje('Error de conexión');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" padding={2}>
      <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" color="secondary" fontWeight="bold" gutterBottom>
            Dar de Alta Empleado
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : empleados.length === 0 ? (
            <Typography mt={3} align="center" color="textSecondary">
              No hay empleados inactivos para reactivar.
            </Typography>
          ) : (
            <>
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel>Empleado Inactivo</InputLabel>
                <Select
                  value={seleccionado}
                  onChange={(e) => setSeleccionado(e.target.value)}
                  label="Empleado Inactivo"
                >
                  {empleados.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.numero_empleado} - {emp.nombre} {emp.apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={!seleccionado}
                onClick={darAlta}
              >
                Confirmar Alta
              </Button>
            </>
          )}

          {mensaje && (
            <Alert severity={esError ? 'error' : 'success'} sx={{ mt: 2 }}>
              {mensaje}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
