import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface Sucursal {
  id: string;
  nombre: string;
  localidad: string;
  direccion: string;
  telefono: string;
}

export default function ListadoSucursales() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [sucursalAEliminar, setSucursalAEliminar] = useState<Sucursal | null>(null);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean, mensaje: string }>({ open: false, mensaje: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/sucursales/all')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener las sucursales');
        return res.json();
      })
      .then(data => {
        setSucursales(data);
        setLoading(false);
      })
      .catch(() => {
        setMensaje('No se pudo cargar el listado de sucursales');
        setEsError(true);
        setLoading(false);
      });
  }, []);

  const handleEditar = (id: string) => {
    navigate('/ModificarSucursalForm', { state: { sucursalId: id } });
  };

  const handleEliminar = async (id: string) => {
    const sucursal = sucursales.find(s => s.id === id);
    if (!sucursal) return;

    const token = localStorage.getItem('token');
    try {
      const resCheck = await fetch(`http://localhost:5000/sucursales/asignados/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataCheck = await resCheck.json();

      if (!resCheck.ok) {
        setMensaje(dataCheck.error || 'Error al verificar asignaciones');
        setEsError(true);
        return;
      }

      if (dataCheck.empleados > 0 || dataCheck.vehiculos > 0) {
        setErrorDialog({
          open: true,
          mensaje: `No se puede eliminar la sucursal "${sucursal.nombre}" porque tiene ` +
            `${dataCheck.empleados} empleado(s) y ${dataCheck.vehiculos} vehículo(s) asignado(s).`
        });
        return;
      }

      setSucursalAEliminar(sucursal);
    } catch {
      setMensaje('Error de conexión con el servidor');
      setEsError(true);
    }
  };

  const confirmarEliminacion = async () => {
    if (!sucursalAEliminar) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/sucursales/eliminar/${sucursalAEliminar.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSucursales(prev => prev.filter(s => s.id !== sucursalAEliminar.id));
        setMensaje(data.mensaje || `Sucursal "${sucursalAEliminar.nombre}" eliminada`);
        setEsError(false);
      } else {
        setMensaje(data.error || 'No se pudo eliminar la sucursal');
        setEsError(true);
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
      setEsError(true);
    } finally {
      setSucursalAEliminar(null);
    }
  };

  return (
    <Box display="flex" justifyContent="center" padding={4} bgcolor="#f4f4f4" minHeight="100vh">
      <Card sx={{ width: '100%', maxWidth: 1000, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" align="center" fontWeight="bold" color="secondary" gutterBottom>
            Sucursales Registradas
          </Typography>

          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {mensaje && (
            <Alert severity={esError ? 'error' : 'success'} sx={{ mt: 3 }}>
              {mensaje}
            </Alert>
          )}

          {!loading && (
            sucursales.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Localidad</strong></TableCell>
                      <TableCell><strong>Dirección</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell align="center"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sucursales.map((sucursal) => (
                      <TableRow key={sucursal.id}>
                        <TableCell>{sucursal.nombre}</TableCell>
                        <TableCell>{sucursal.localidad}</TableCell>
                        <TableCell>{sucursal.direccion}</TableCell>
                        <TableCell>{sucursal.telefono}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleEditar(sucursal.id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleEliminar(sucursal.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography align="center" color="textSecondary" mt={4}>
                No hay sucursales registradas para mostrar.
              </Typography>
            )
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog open={Boolean(sucursalAEliminar)} onClose={() => setSucursalAEliminar(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que querés eliminar la sucursal "{sucursalAEliminar?.nombre}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSucursalAEliminar(null)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmarEliminacion} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de error con un solo botón */}
      <Dialog open={errorDialog.open} onClose={() => setErrorDialog({ open: false, mensaje: '' })}>
        <DialogTitle>Error al eliminar</DialogTitle>
        <DialogContent>
          <Typography>{errorDialog.mensaje}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog({ open: false, mensaje: '' })} autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
