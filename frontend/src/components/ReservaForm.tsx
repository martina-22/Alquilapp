import { useSearchParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import AccessTimeIcon from "@mui/icons-material/AccessTime"

export const ReservaForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [reservaData, setReservaData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const usuario_id = searchParams.get("usuario_id")
      const vehiculo_id = searchParams.get("vehiculo_id")
      const fecha_inicio = searchParams.get("fecha_inicio")
      const fecha_fin = searchParams.get("fecha_fin")
      const hora_retiro = searchParams.get("hora_retiro")
      const hora_devolucion = searchParams.get("hora_devolucion")

      try {
        const [usuarioRes, vehiculoRes] = await Promise.all([
          fetch(`http://localhost:5000/usuarios/${usuario_id}`),
          fetch(`http://localhost:5000/vehiculos/${vehiculo_id}`)
        ])

        const usuario = await usuarioRes.json()
        const vehiculo = await vehiculoRes.json()

        const precioPorDia = vehiculo.precio_dia

        const fechaInicio = new Date(fecha_inicio!)
        const fechaFin = new Date(fecha_fin!)
        const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime()
        const diferenciaDias = Math.max(Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)), 1)

        const montoEstimado = precioPorDia * diferenciaDias

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
        }

        setReservaData(data)
      } catch (err) {
        console.error("❌ Error al obtener datos:", err)
      }
    }

    fetchData()
  }, [searchParams])
const handlePagar = async () => {
  try {
    console.log("➡️ Iniciando pago con datos:", reservaData)

    const res = await fetch("http://localhost:5000/pagos/pagar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reservaData,
        monto_total: reservaData.monto_estimado
      })
    })

    const data = await res.json()
    console.log("🔁 Respuesta de /pagar:", data)

    if (!data.init_point || !data.external_reference)
      throw new Error("Faltan datos en la respuesta de Mercado Pago")

    const popup = window.open(data.init_point, "_blank", "width=600,height=800")

    const interval = setInterval(async () => {
      try {
        const statusRes = await fetch(`http://localhost:5000/pagos/status/${data.external_reference}`)
        const statusData = await statusRes.json()

        console.log("🟡 Estado del pago:", statusData)

        if (statusData.status === "approved") {
          clearInterval(interval)
          popup?.close()

         const reservaRes = await fetch("http://localhost:5000/reservas/iniciar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...reservaData,
            monto_total: reservaData.monto_estimado,
            pagada: true  // ✅ importante
          })
        })


          const reserva = await reservaRes.json()
          console.log("✅ Reserva creada:", reserva)

          alert("✅ Pago confirmado y reserva creada")
          navigate(`/verreservas?usuario_id=${reservaData.usuario_id}`)
        }
      } catch (err) {
        console.error("Error verificando el pago:", err)
      }
    }, 3000)
  } catch (err: any) {
    console.error("❌ Error en handlePagar:", err)
    alert("Error al iniciar el pago: " + err.message)
  }
}



  const handleVolver = () => {
    navigate("/")
  }

  if (!reservaData) return <Typography color="#2B2645">Cargando...</Typography>

  return (
  <Box
    sx={{

      backgroundColor: "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 1,
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden"
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
      elevation={6}
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: "#2B2645",
        color: "#FFFFFF",
        width: "100%",
        maxWidth: 500, // más angosto
        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1
      }}
    >
      {/* Encabezado compacto */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/src/assets/logo.png"
          alt="Logo"
          style={{ height: 40 }} // achicamos el logo
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Confirmación de Reserva
        </Typography>
      </Box>

      <Box width="100%" textAlign="left">
        <Typography sx={{ color: "#30BBCB", fontWeight: 600, fontSize: "0.95rem" }}>
          Vehículo:
        </Typography>
        <Typography mb={1} fontSize="0.95rem">
          {reservaData.nombre_vehiculo}
        </Typography>

        <Typography sx={{ color: "#9D5FB9", fontWeight: 600, fontSize: "0.95rem" }}>
          Usuario:
        </Typography>
        <Typography mb={1} fontSize="0.95rem">
          {reservaData.nombre_usuario}
        </Typography>

        <Typography sx={{ color: "#9D5FB9", fontWeight: 600, fontSize: "0.95rem" }}>
          Fecha de inicio:
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <CalendarMonthIcon fontSize="small" />
          <Typography fontSize="0.9rem">{reservaData.fecha_inicio}</Typography>
          <AccessTimeIcon fontSize="small" />
          <Typography fontSize="0.9rem">{reservaData.hora_retiro}</Typography>
        </Box>

        <Typography sx={{ color: "#9D5FB9", fontWeight: 600, fontSize: "0.95rem" }}>
          Fecha de finalización:
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarMonthIcon fontSize="small" />
          <Typography fontSize="0.9rem">{reservaData.fecha_fin}</Typography>
          <AccessTimeIcon fontSize="small" />
          <Typography fontSize="0.9rem">{reservaData.hora_devolucion}</Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#ffffff44" }} />

        <Typography sx={{ color: "#30BBCB", fontWeight: 600, fontSize: "0.95rem" }}>
          Monto estimado:
        </Typography>
        <Typography variant="h6" mb={2}>${reservaData.monto_estimado}</Typography>
      </Box>

      <Button
        variant="contained"
        onClick={handlePagar}
        sx={{
          backgroundColor: "#5766B2",
          color: "#FFFFFF",
          fontWeight: 600,
          fontSize: "0.875rem",
          px: 3,
          py: 1,
          "&:hover": {
            backgroundColor: "#6C3D8E"
          }
        }}
      >
        Pagar
      </Button>
    </Paper>
  </Box>
)

}
