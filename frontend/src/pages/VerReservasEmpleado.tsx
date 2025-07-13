import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
} from "@mui/material";
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

export const VerReservasEmpleado = () => {
  const [reservas, setReservas] = useState<any[]>([]);
  const [openExtrasDialog, setOpenExtrasDialog] = useState(false);
  const [openSucursalDialog, setOpenSucursalDialog] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<any | null>(null);
  const [extraId, setExtraId] = useState("");
  const [nuevaSucursalId, setNuevaSucursalId] = useState("");
  const [snackbar, setSnackbar] = useState("");

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    const res = await authFetch("http://localhost:5000/reservas/todas");
    const data = await res.json();
    setReservas(data);
  };

  const handleMarcarDevuelto = async (reserva_id: number) => {
    const res = await authFetch(
      `http://localhost:5000/reservas/marcar-devuelto/${reserva_id}`,
      { method: "PUT" }
    );
    const data = await res.json();
    setSnackbar(data.message);
    fetchReservas();
  };

  const handleAgregarExtra = async () => {
    await authFetch(`http://localhost:5000/reservas/agregar-extra`, {
      method: "POST",
      body: JSON.stringify({
        reserva_id: selectedReserva.id,
        extra_id: parseInt(extraId),
      }),
    });
    setSnackbar("Extra agregado");
    setOpenExtrasDialog(false);
    setExtraId("");
  };

  const handleModificarSucursal = async () => {
    await authFetch(
      `http://localhost:5000/reservas/modificar-sucursal/${selectedReserva.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ sucursal_id: parseInt(nuevaSucursalId) }),
      }
    );
    setSnackbar("Sucursal modificada");
    setOpenSucursalDialog(false);
    setNuevaSucursalId("");
    fetchReservas();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Reservas de Clientes
      </Typography>

      {reservas.map((reserva) => (
        <Card key={reserva.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">
              #{reserva.id} - {reserva.usuario?.nombre} {reserva.usuario?.apellido}
            </Typography>
            <Typography>
              Vehículo: {reserva.vehiculo?.marca} {reserva.vehiculo?.modelo}
            </Typography>
            <Typography>Estado: {reserva.estado?.nombre}</Typography>
            <Typography>
              Desde: {new Date(reserva.fecha_inicio).toLocaleDateString()} - Hasta:{" "}
              {new Date(reserva.fecha_fin).toLocaleDateString()}
            </Typography>

            <Box mt={2} display="flex" gap={1}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setSelectedReserva(reserva);
                  setOpenExtrasDialog(true);
                }}
              >
                Agregar extra
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setSelectedReserva(reserva);
                  setOpenSucursalDialog(true);
                }}
              >
                Modificar sucursal
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={() => handleMarcarDevuelto(reserva.id)}
              >
                Marcar devuelto
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Diálogo agregar extra */}
      <Dialog open={openExtrasDialog} onClose={() => setOpenExtrasDialog(false)}>
        <DialogTitle>Agregar extra</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID de extra"
            type="number"
            value={extraId}
            onChange={(e) => setExtraId(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExtrasDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAgregarExtra}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo modificar sucursal */}
      <Dialog open={openSucursalDialog} onClose={() => setOpenSucursalDialog(false)}>
        <DialogTitle>Modificar sucursal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID de nueva sucursal"
            type="number"
            value={nuevaSucursalId}
            onChange={(e) => setNuevaSucursalId(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSucursalDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleModificarSucursal}>
            Modificar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar("")}
        message={snackbar}
      />
    </Box>
  );
};
export default VerReservasEmpleado;