import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { authFetch } from '../utils/authFetch';

interface Extra {
  id: number;
  nombre: string;
}

interface Reserva {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado_id: number;
  pagada: boolean;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  vehiculo: {
    marca: string;
    modelo: string;
    anio: number;
  };
}

const EditarReservaEmpleado = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [selectedExtraId, setSelectedExtraId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch(`http://localhost:5000/reservas/detalle/${id}`);
        const data = await res.json();
        setReserva(data);

        const resExtras = await authFetch('http://localhost:5000/extras/todos');
        const dataExtras = await resExtras.json();
        setExtras(dataExtras);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const agregarExtra = async () => {
    if (selectedExtraId === '') return;

    try {
      const res = await authFetch(`http://localhost:5000/reservas/agregar-extra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva_id: parseInt(id!),
          extra_id: selectedExtraId
        })
      });

      if (res.ok) {
        alert('✅ Extra agregado correctamente');
        setSelectedExtraId('');
      } else {
        alert('❌ Error al agregar el extra');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const marcarComoDevuelto = async () => {
    await authFetch(`http://localhost:5000/reservas/marcar-devuelto/${id}`, {
      method: 'PUT'
    });
    alert('Vehículo marcado como devuelto.');
    navigate('/empleado/reservas-activas');
  };

  const finalizarReserva = async () => {
    await authFetch(`http://localhost:5000/reservas/finalizar/${id}`, {
      method: 'PUT'
    });
    alert('Reserva finalizada.');
    navigate('/empleado/reservas-activas');
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" mb={2}>Editar Reserva #{id}</Typography>

        <Typography><strong>Cliente:</strong> {reserva?.usuario.nombre} {reserva?.usuario.apellido}</Typography>
        <Typography><strong>Vehículo:</strong> {reserva?.vehiculo.marca} {reserva?.vehiculo.modelo} ({reserva?.vehiculo.anio})</Typography>
        <Typography><strong>Desde:</strong> {reserva?.fecha_inicio}</Typography>
        <Typography><strong>Hasta:</strong> {reserva?.fecha_fin}</Typography>

        {/* SELECCIÓN DE EXTRA */}
        <Box mt={4}>
          <FormControl fullWidth>
            <InputLabel id="extra-label">Seleccionar Extra</InputLabel>
            <Select
              labelId="extra-label"
              value={selectedExtraId}
              onChange={(e) => setSelectedExtraId(Number(e.target.value))}
              label="Seleccionar Extra"
            >
              {extras.map((extra) => (
                <MenuItem key={extra.id} value={extra.id}>
                  {extra.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={agregarExtra}
            sx={{ mt: 2 }}
            disabled={selectedExtraId === ''}
          >
            Agregar Extra
          </Button>
        </Box>

        {/* ACCIONES */}
        <Box mt={4}>
          <Button variant="contained" color="success" onClick={marcarComoDevuelto} sx={{ mr: 2 }}>
            Marcar como Devuelto
          </Button>
          <Button variant="contained" color="secondary" onClick={finalizarReserva}>
            Finalizar Reserva
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditarReservaEmpleado;
