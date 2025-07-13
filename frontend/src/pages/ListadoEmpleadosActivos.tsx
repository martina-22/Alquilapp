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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
const API_URL = 'http://localhost:5000';

export default function ListadoEmpleadosActivos() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/usuarios/empleados/activos`)
      .then(res => res.json())
      .then(data => setEmpleados(data))
      .catch(() => setEmpleados([]));

    fetch(`${API_URL}/sucursales/all`)
      .then(res => res.json())
      .then(data => {
        const sucMap: Record<string, string> = {};
        data.forEach((suc: any) => {
          sucMap[suc.id] = suc.nombre;
        });
        setSucursales(sucMap);
      })
      .catch(() => setSucursales({}));
  }, []);

  const handleModificar = (empleadoId: string) => {
    navigate(`/modificar-empleado/${empleadoId}`);  };

  const handleClickEliminar = (empleadoId: string) => {
    setEmpleadoAEliminar(empleadoId);
    setDialogOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!empleadoAEliminar) return;
    try {
      const res = await fetch(`${API_URL}/usuarios/${empleadoAEliminar}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setEmpleados(prev => prev.filter(emp => emp.id !== empleadoAEliminar));
        setMensaje(data.message || 'Empleado eliminado');
        setEsError(false);
      } else {
        setMensaje(data.message || 'Error al eliminar');
        setEsError(true);
      }
    } catch {
      setMensaje('Error de conexión');
      setEsError(true);
    } finally {
      setDialogOpen(false);
      setEmpleadoAEliminar(null);
      setOpenSnackbar(true);
    }
  };

  const handleCancelarEliminar = () => {
    setDialogOpen(false);
    setEmpleadoAEliminar(null);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f4f4" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 1100, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Box position="relative" mb={3}>
            <IconButton
              onClick={() => navigate('/GestionEmpleados')}
              color="secondary"
              sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" align="center" color="secondary" fontWeight="bold">
              Empleado Activos
            </Typography>
          </Box>

          {empleados.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>N° Empleado</TableCell>
                    <TableCell>Sucursal</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empleados.map(emp => (
                    <TableRow key={emp.numero_empleado}>
                      <TableCell>{emp.nombre}</TableCell>
                      <TableCell>{emp.apellido}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.telefono}</TableCell>
                      <TableCell>{emp.numero_empleado}</TableCell>
                      <TableCell>{sucursales[emp.sucursal_id] || emp.sucursal_id}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleModificar(emp.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleClickEliminar(emp.id)}>
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
              No hay empleados activos registrados.
            </Typography>
          )}

          {/* Diálogo de confirmación */}
          <Dialog open={dialogOpen} onClose={handleCancelarEliminar}>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro de que querés eliminar este empleado? Esta acción se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelarEliminar}>Cancelar</Button>
              <Button onClick={handleConfirmarEliminar} color="error" variant="contained">
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
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
        </CardContent>
      </Card>
    </Box>
  );
}