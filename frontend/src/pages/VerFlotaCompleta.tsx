import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, CircularProgress, Snackbar, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_URL = 'http://localhost:5000';

interface VehiculoPorSucursal {
  marca: string;
  modelo: string;
  anio: string | number;
  categoria: string;
  matricula: string;
  localidad: string;
  localidad_nombre: string;
  capacidad: number;
  politica_cancelacion: string;
  precio_por_dia: number;
  estado: string;
}

interface SucursalConVehiculos {
  sucursal_id: number;
  sucursal_nombre: string;
  localidad_nombre: string;
  vehiculos: VehiculoPorSucursal[];
}

export default function ListadoFlota() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<string | null>(null);
  const [mostrandoFlotaPorSucursal, setMostrandoFlotaPorSucursal] = useState(false);
  const [flotaPorSucursal, setFlotaPorSucursal] = useState<SucursalConVehiculos[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/vehiculos/flota`)
      .then(res => res.json())
      .then(data => {
        setVehiculos(data.vehiculos);
        setLoading(false);
      })
      .catch(() => {
        setMensaje('Error al cargar la flota');
        setEsError(true);
        setOpenSnackbar(true);
        setLoading(false);
      });
  }, []);

  const verFlotaPorSucursal = async () => {
    try {
      const res = await fetch(`${API_URL}/vehiculos/flota-por-sucursal`);
      const data = await res.json();
      setFlotaPorSucursal(data.sucursales);
      setMostrandoFlotaPorSucursal(true);
    } catch (error) {
      console.error(error);
      setMensaje('Error al obtener la flota agrupada por sucursal');
      setEsError(true);
      setOpenSnackbar(true);
    }
  };

  const handleModificar = (patente: string) => {
    navigate('/ModificarVehiculo', { state: { patente } });
  };

  const handleEliminar = (patente: string) => {
    setVehiculoAEliminar(patente);
  };

  const confirmarEliminacion = async () => {
    if (!vehiculoAEliminar) return;

    try {
      const res = await fetch(`${API_URL}/vehiculos/eliminar/${vehiculoAEliminar}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setVehiculos(prev => prev.filter(v => v.matricula !== vehiculoAEliminar));
        setMensaje(data.message || `Vehículo ${vehiculoAEliminar} eliminado correctamente`);
        setEsError(false);
      } else {
        setMensaje(data.message || 'Error al eliminar el vehículo');
        setEsError(true);
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
      setEsError(true);
    } finally {
      setOpenSnackbar(true);
      setVehiculoAEliminar(null);
    }
  };

  return (
    <Box display="flex" justifyContent="center" padding={4} bgcolor="#f4f4f4" minHeight="100vh">
      <Card sx={{ width: '100%', maxWidth: 1200, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
         <Box position="relative" mb={2}>
          <IconButton
            onClick={() => navigate('/GestionFlota')}
            color="secondary"
            sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" color="secondary" align="center">
            Flota de Vehículos
          </Typography>
        </Box>


          <Box display="flex" justifyContent="center" gap={2} mb={2}>
            {!mostrandoFlotaPorSucursal ? (
              <Button variant="contained" color="primary" onClick={verFlotaPorSucursal}>
                Ver Flota por Sucursal
              </Button>
            ) : (
              <Button variant="contained" color="secondary" onClick={() => setMostrandoFlotaPorSucursal(false)}>
                Ver Listado Completo
              </Button>
            )}
          </Box>

          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && !mostrandoFlotaPorSucursal && (
            vehiculos.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Marca</strong></TableCell>
                      <TableCell><strong>Modelo</strong></TableCell>
                      <TableCell><strong>Año</strong></TableCell>
                      <TableCell><strong>Categoría</strong></TableCell>
                      <TableCell><strong>Capacidad</strong></TableCell>
                      <TableCell><strong>Matrícula</strong></TableCell>
                      <TableCell><strong>Localidad</strong></TableCell>
                      <TableCell><strong>Precio/Día</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell align="center"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehiculos.map((vehiculo) => (
                      <TableRow key={vehiculo.matricula}>
                        <TableCell>{vehiculo.marca}</TableCell>
                        <TableCell>{vehiculo.modelo}</TableCell>
                        <TableCell>{vehiculo.anio}</TableCell>
                        <TableCell>{vehiculo.tipo}</TableCell>
                        <TableCell>{vehiculo.capacidad}</TableCell>
                        <TableCell>{vehiculo.matricula}</TableCell>
                        <TableCell>{vehiculo.localidad_nombre || 'Sin asignar'}</TableCell>
                        <TableCell>${vehiculo.precio_por_dia}</TableCell>
                        <TableCell>{vehiculo.estado_nombre}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleModificar(vehiculo.matricula)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleEliminar(vehiculo.matricula)}>
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
                No hay vehículos disponibles para mostrar.
              </Typography>
            )
          )}

          {!loading && mostrandoFlotaPorSucursal && (
            <Box mt={3}>
              {flotaPorSucursal.map((sucursal) => (
                <Box key={sucursal.sucursal_id} mb={3} p={2} border="1px solid #ccc" borderRadius={2}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {sucursal.sucursal_nombre} - {sucursal.localidad_nombre}
                  </Typography>

                  {sucursal.vehiculos.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Marca</strong></TableCell>
                            <TableCell><strong>Modelo</strong></TableCell>
                            <TableCell><strong>Año</strong></TableCell>
                            <TableCell><strong>Categoría</strong></TableCell>
                            <TableCell><strong>Capacidad</strong></TableCell>
                            <TableCell><strong>Matrícula</strong></TableCell>
                            <TableCell><strong>Precio/Día</strong></TableCell>
                            <TableCell><strong>Estado</strong></TableCell>
                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sucursal.vehiculos.map((veh) => (
                            <TableRow key={veh.matricula}>
                              <TableCell>{veh.marca}</TableCell>
                              <TableCell>{veh.modelo}</TableCell>
                              <TableCell>{veh.anio}</TableCell>
                              <TableCell>{veh.categoria}</TableCell>
                              <TableCell>{veh.capacidad}</TableCell>
                              <TableCell>{veh.matricula}</TableCell>
                              <TableCell>${veh.precio_por_dia}</TableCell>
                              <TableCell>{veh.estado}</TableCell>
                              <TableCell align="center">
                                <IconButton color="primary" onClick={() => handleModificar(veh.matricula)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleEliminar(veh.matricula)}>
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="textSecondary" mt={1}>No hay vehículos asignados a esta sucursal</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Dialog open={Boolean(vehiculoAEliminar)} onClose={() => setVehiculoAEliminar(null)}>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro de que querés eliminar el vehículo {vehiculoAEliminar}?
                Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVehiculoAEliminar(null)} color="primary">
                Cancelar
              </Button>
              <Button onClick={confirmarEliminacion} color="error" variant="contained">
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>

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