import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

// ✅ Interfaces
interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha_registro: string;
}

interface Reserva {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  usuario: {
    id: number;
    nombre: string;
  };
  vehiculo: {
    id: number;
    modelo: string;
  };
}

const Reportes: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [desde, setDesde] = useState<Dayjs | null>(dayjs().subtract(7, "day"));
  const [hasta, setHasta] = useState<Dayjs | null>(dayjs());
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [openUsuarios, setOpenUsuarios] = useState(false);
  const [openReservas, setOpenReservas] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setUsuarios([]);
    setReservas([]);
  };

  const authFetch = async (url: string): Promise<Response> => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No hay token en localStorage");
      throw new Error("Token JWT no encontrado");
    }

    const response = await fetch("http://localhost:5000" + url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("❌ Error en fetch:", error);
      throw new Error(error?.message || "Error en la solicitud");
    }

    return response;
  };

  const buscarUsuarios = async () => {
    try {
      const res = await authFetch(
        `/usuarios/registrados-por-fecha?desde=${desde?.format("YYYY-MM-DD")}&hasta=${hasta?.format("YYYY-MM-DD")}`
      );
      const data: Usuario[] = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al buscar usuarios:", error);
      setUsuarios([]);
    }
  };

  const buscarReservas = async () => {
    try {
      const res = await authFetch(
        `/reservas/vehiculos-reservados-por-fecha?desde=${desde?.format("YYYY-MM-DD")}&hasta=${hasta?.format("YYYY-MM-DD")}`
      );
      const data: Reserva[] = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al buscar reservas:", error);
      setReservas([]);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reportes de Registro
      </Typography>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Usuarios Registrados" />
        <Tab label="Vehículos Reservados" />
      </Tabs>
      <Box display="flex" gap={2} my={2}>
        <DatePicker label="Desde" value={desde} onChange={setDesde} />
        <DatePicker label="Hasta" value={hasta} onChange={setHasta} />
        <Button
          variant="contained"
          onClick={tab === 0 ? buscarUsuarios : buscarReservas}
        >
          {tab === 0 ? "Buscar Usuarios" : "Buscar Reservas"}
        </Button>
      </Box>

      {tab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ display: "inline", mr: 2 }}>
            Usuarios encontrados: {usuarios.length}
          </Typography>
          {usuarios.length > 0 && (
            <Button variant="outlined" onClick={() => setOpenUsuarios(true)}>
              Ver más
            </Button>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ display: "inline", mr: 2 }}>
            Reservas encontradas: {reservas.length}
          </Typography>
          {reservas.length > 0 && (
            <Button variant="outlined" onClick={() => setOpenReservas(true)}>
              Ver más
            </Button>
          )}
        </Box>
      )}

      {/* Modal Usuarios */}
      <Dialog open={openUsuarios} onClose={() => setOpenUsuarios(false)} fullWidth maxWidth="sm">
        <DialogTitle>Usuarios Registrados</DialogTitle>
        <DialogContent dividers>
          {usuarios.map((u) => (
            <Box key={u.id} sx={{ mb: 2 }}>
              <Typography><strong>Nombre:</strong> {u.nombre} {u.apellido}</Typography>
              <Typography><strong>Email:</strong> {u.email}</Typography>
              <Typography><strong>Fecha de registro:</strong> {new Date(u.fecha_registro).toLocaleString()}</Typography>
              <hr />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsuarios(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Reservas */}
      <Dialog open={openReservas} onClose={() => setOpenReservas(false)} fullWidth maxWidth="sm">
        <DialogTitle>Vehículos Reservados</DialogTitle>
        <DialogContent dividers>
          {reservas.map((r) => (
            <Box key={r.id} sx={{ mb: 2 }}>
              <Typography><strong>Vehículo:</strong> {r.vehiculo.modelo}</Typography>
              <Typography><strong>Cliente:</strong> {r.usuario.nombre}</Typography>
              <Typography><strong>Desde:</strong> {new Date(r.fecha_inicio).toLocaleString()}</Typography>
              <Typography><strong>Hasta:</strong> {new Date(r.fecha_fin).toLocaleString()}</Typography>
              <hr />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReservas(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reportes;
