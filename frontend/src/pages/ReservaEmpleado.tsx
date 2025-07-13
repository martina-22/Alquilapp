import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import { authFetch } from '../utils/authFetch';

interface Reserva {
  id: number;
  vehiculo: {
    marca: string;
    modelo: string;
  };
  usuario: {
    nombre: string;
    apellido: string;
  };
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  sucursal: {
    nombre: string;
  };
}

const TablaReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);

  useEffect(() => {
    const fetchReservas = async () => {
      const res = await authFetch('http://localhost:5000/reservas/ver');
      const data = await res.json();
      setReservas(data);
    };
    fetchReservas();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" color="#2B2645" gutterBottom>
        Reservas
      </Typography>

      <Paper sx={{ overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Vehículo</strong></TableCell>
              <TableCell><strong>Sucursal</strong></TableCell>
              <TableCell><strong>Desde</strong></TableCell>
              <TableCell><strong>Hasta</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCell>{reserva.usuario.nombre} {reserva.usuario.apellido}</TableCell>
                <TableCell>{reserva.vehiculo.marca} {reserva.vehiculo.modelo}</TableCell>
                <TableCell>{reserva.sucursal.nombre}</TableCell>
                <TableCell>{new Date(reserva.fecha_inicio).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(reserva.fecha_fin).toLocaleDateString()}</TableCell>
                <TableCell>{reserva.estado}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => console.log('Editar reserva', reserva.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TablaReservas;
