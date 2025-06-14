import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authFetch, obtenerUsuarioIdDesdeToken } from "../utils/authFetch";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const ReservaForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservaData, setReservaData] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
 const formatearFecha = (fechaISO: string) => {
                const [año, mes, dia] = fechaISO.split("-");
                return `${dia}/${mes}/${año}`;
              };
  useEffect(() => {
    const fetchData = async () => {
      const usuario_id = obtenerUsuarioIdDesdeToken();
      const vehiculo_id = searchParams.get("vehiculo_id");
      const fecha_inicio = searchParams.get("fecha_inicio");
      const fecha_fin = searchParams.get("fecha_fin");
      const hora_retiro = searchParams.get("hora_retiro");
      const hora_devolucion = searchParams.get("hora_devolucion");
      
      if (!usuario_id || !vehiculo_id || !fecha_inicio || !fecha_fin || !hora_retiro || !hora_devolucion) {
        alert("Faltan datos para procesar la reserva.");
        return;
      }

      try {
        const [usuarioRes, vehiculoRes] = await Promise.all([
          fetch(`http://localhost:5000/usuarios/${usuario_id}`),
          fetch(`http://localhost:5000/vehiculos/${vehiculo_id}`)
        ]);

        const usuario = await usuarioRes.json();
        const vehiculo = await vehiculoRes.json();

        const precioPorDia = vehiculo.precio_dia;

        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);
        const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
        const diferenciaDias = Math.max(Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)), 1);

        const montoEstimado = precioPorDia * diferenciaDias;
       

        const data = {
          usuario_id,
          vehiculo_id,
          fecha_inicio,
          fecha_fin,
          hora_retiro,
          hora_devolucion,
          nombre_usuario: `${usuario.nombre} ${usuario.apellido}`,
          nombre_vehiculo: `${vehiculo.marca} ${vehiculo.modelo}`,
          monto_estimado: montoEstimado
        };

        setReservaData(data);
      } catch (err) {
        console.error("❌ Error al obtener datos:", err);
      }
    };

    fetchData();
  }, [searchParams]);

  const handlePagar = async () => {
    try {
      setIsPaying(true);
      const res = await fetch("http://localhost:5000/pagos/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reservaData,
          monto_total: reservaData.monto_estimado
        })
      });

      const data = await res.json();
      if (!data.init_point || !data.external_reference)
        throw new Error("Faltan datos en la respuesta de Mercado Pago");

      const popup = window.open(data.init_point, "_blank", "width=600,height=800");

      const interval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(interval);
          setIsPaying(false);
          return;
        }

        try {
          const statusRes = await fetch(`http://localhost:5000/pagos/status/${data.external_reference}`);
          const statusData = await statusRes.json();

          if (statusData.status === "approved") {
            clearInterval(interval);
            popup?.close();

            const reservaRes = await fetch("http://localhost:5000/reservas/iniciar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...reservaData,
                monto_total: reservaData.monto_estimado,
                pagada: true
              })
            });

            await reservaRes.json();
            alert("✅ Pago confirmado y reserva creada");
            navigate(`/verreservas`);
          }
        } catch (err) {
          console.error("Error verificando el pago:", err);
        }
      }, 3000);
    } catch (err: any) {
      console.error("❌ Error en handlePagar:", err);
      alert("Error al iniciar el pago: " + err.message);
    }
  };

  const handleVolver = () => {
    navigate("/");
  };

  if (!reservaData) return <Typography color="secondary">Cargando...</Typography>;

  return (
    <Box
      sx={{
        backgroundColor: "#F0F2F5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        minHeight: "100vh",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <IconButton
        onClick={handleVolver}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          color: "#6C3D8E"
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper
        elevation={4}
        sx={{
          px: 3,
          py: 2,
          borderRadius: 3,
          backgroundColor: "secondary",
          color: "#2B2645",
          width: "100%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: "Poppins, sans-serif",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Box textAlign="center" mb={2}>
          <img src="/src/assets/logo.png" alt="Logo" style={{ height: 42 }} />
          <Typography variant="h5" fontWeight={600} mt={1}>
            Confirmación de reserva
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography sx={{ fontWeight: 500, color: "#30BBCB" }}>Vehículo</Typography>
          <Typography mb={1}>{reservaData.nombre_vehiculo}</Typography>

          <Typography sx={{ fontWeight: 500, color: "#9D5FB9" }}>Usuario</Typography>
          <Typography mb={1}>{reservaData.nombre_usuario}</Typography>
        </Box>

        <Box mb={2}>
          <Typography sx={{ fontWeight: 500, color: "#6C3D8E" }}>Fecha de inicio</Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography>{formatearFecha(reservaData.fecha_inicio)}</Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTimeIcon sx={{ fontSize: 18, color: "#6C3D8E" }} />
              <Typography>{reservaData.hora_retiro}</Typography>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 500, color: "#6C3D8E" }}>Fecha de finalización</Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography>{formatearFecha(reservaData.fecha_inicio)}</Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "#6C3D8E" }} />
            <Typography>{reservaData.hora_devolucion}</Typography>
          </Box>
        </Box>

        </Box>

        <Divider sx={{ my: 2, borderColor: "#E0E0E0" }} />

        <Box textAlign="center" mb={2}>
          <Typography sx={{ fontWeight: 500, color: "#30BBCB" }}>
            Monto estimado
          </Typography>
          <Typography variant="h6" fontWeight={700}>${reservaData.monto_estimado}</Typography>
        </Box>

        <Box textAlign="center" mt={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handlePagar}
            disabled={isPaying}
            sx={{
              backgroundColor: "#5766B2",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "1rem",
              py: 1.3,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#6C3D8E"
              }
            }}
          >
            {isPaying ? "Procesando..." : "Pagar"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
