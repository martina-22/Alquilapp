import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function EliminarVehiculoForm() {
  const [patente, setPatente] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const handleEliminar = async () => {
    try {
      const response = await fetch(`http://localhost:5000/vehiculos/eliminar/${patente}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      setMensaje(data.message);
      setEsError(!response.ok);
    } catch (error) {
      setMensaje('Error al conectar con el servidor');
      setEsError(true);
    } finally {
      setDialogoAbierto(false);
    }
  };

const handleConfirmarClick = async () => {
  const patenteFormateada = patente.trim().toUpperCase();

  if (!patenteFormateada) {
    setMensaje('La patente no puede estar vacía');
    setEsError(true);
    return;
  }

  const formatoValido = /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/.test(patenteFormateada);
  if (!formatoValido) {
    setMensaje('Formato inválido. Ejemplo válido: ABC123 o AB123CD');
    setEsError(true);
    return;
  }

  // Consultar si existe en backend
  try {
    const res = await fetch(`http://localhost:5000/vehiculos/flota`);
    const data = await res.json();

    const encontrado = data.vehiculos.find(
      (v: { matricula: string }) => v.matricula.toUpperCase() === patenteFormateada
    );

    if (!encontrado) {
      setMensaje(`No se encontró un vehículo con la patente ${patenteFormateada}`);
      setEsError(true);
      return;
    }

    // Todo ok, mostrar confirmación
    setMensaje('');
    setEsError(false);
    setDialogoAbierto(true);

  } catch (error) {
    setMensaje('Error al conectar con el servidor para validar la patente');
    setEsError(true);
  }
};


  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Eliminar Vehículo
          </Typography>

          <TextField
            label="Patente"
            value={patente}
            onChange={(e) => setPatente(e.target.value.toUpperCase())}
            fullWidth
            margin="normal"
            inputProps={{
              pattern: '^[A-Z0-9]+$',
              inputMode: 'text',
            }}
          />

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleConfirmarClick}
            sx={{ mt: 2 }}
          >
            Eliminar
          </Button>

          {mensaje && (
            <Alert severity={esError ? 'error' : 'success'} sx={{ mt: 2 }}>
              {mensaje}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés eliminar el vehículo con patente <strong>{patente}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAbierto(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}