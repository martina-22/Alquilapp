import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authFetch } from '../utils/authFetch';
import { useNavigate } from 'react-router-dom';

// Interfaces para el tipado de datos
interface Usuario {
  nombre: string;
  apellido: string;
}

interface Vehiculo {
  marca: string;
  modelo: string;
}

interface Reserva {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  usuario: Usuario;
  vehiculo: Vehiculo;
  vehiculo_nombre: string;
}

const ReservasActivasEmpleado = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Función para formatear las fechas
  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Llamada a la API para obtener reservas
  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await authFetch('http://localhost:5000/reservas/activas');
      const data = await res.json();
      setReservas(data);
      setError('');
    } catch (error) {
      console.error('❌ Error al cargar reservas:', error);
      setError('Ocurrió un error al cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <Box p={4}>
      <Box position="relative" mb={3}>
        <IconButton
          onClick={() => navigate('/HomeEmpleado')}
          color="secondary"
          sx={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          aria-label="Volver"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" align="center" color="secondary" fontWeight="bold">
          Reservas Activas
        </Typography>
      </Box>

      <Paper elevation={3}>
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" p={2}>
            {error}
          </Typography>
        ) : reservas.length === 0 ? (
          <Typography align="center" p={2}>
            No hay reservas activas.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Vehículo</strong></TableCell>
                <TableCell><strong>Desde</strong></TableCell>
                <TableCell><strong>Hasta</strong></TableCell>
              
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>
                  {reserva.usuario?.nombre ?? 'Sin nombre'} {reserva.usuario?.apellido ?? ''}
                </TableCell>
                <TableCell>
                  {reserva.vehiculo?.marca ?? 'Desconocida'} {reserva.vehiculo?.modelo ?? ''}
                </TableCell>

                  <TableCell>{formatearFecha(reserva.fecha_inicio)}</TableCell>
                  <TableCell>{formatearFecha(reserva.fecha_fin)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => navigate(`/EditarReservaEmpleado`)}
                      sx={{ color: '#00B7C2' }}
                      aria-label="Editar reserva"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default ReservasActivasEmpleado;
