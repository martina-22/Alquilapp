import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';

export const ReservaCard = () => {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const data = {
    usuario_id: params.get('usuario_id'),
    vehiculo_id: params.get('vehiculo_id'),
    fecha_inicio: params.get('fecha_inicio'),
    fecha_fin: params.get('fecha_fin'),
    hora_retiro: params.get('hora_retiro'),
    hora_devolucion: params.get('hora_devolucion'),
    monto_total: 10000, // podés calcularlo dinámicamente si querés
  };

  const handlePagar = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/pagos/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.init_point) {
        window.location.href = response.init_point;
      } else {
        alert('Error al generar el pago');
        console.error(response.error);
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)',
        color: 'white',
        p: 2,
      }}
    >
      <img
        src="src/assets/logo.png"
        alt="Alquilapp Logo"
        style={{ width: 200, marginBottom: 24 }}
      />

      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: '#240b3a',
          border: '1px solid #45e5ff',
          color: 'white',
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ color: '#45e5ff' }} align="center" gutterBottom>
            Detalles de la Reserva
          </Typography>

          <Divider sx={{ borderColor: '#45e5ff', mb: 2 }} />

          {Object.entries(data).map(([key, value]) => (
            <Typography key={key} sx={{ mb: 1 }}>
              <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {value}
            </Typography>
          ))}

          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={handlePagar}
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Pagar con Mercado Pago'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

//no se si sirve
