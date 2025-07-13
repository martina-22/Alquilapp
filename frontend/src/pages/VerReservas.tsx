import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, CircularProgress, Card, CardContent, IconButton,
  Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  useTheme
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { authFetch } from '../utils/authFetch'

export const VerReserva = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorEls, setAnchorEls] = useState<Record<number, HTMLElement | null>>({})
  const [detalleReserva, setDetalleReserva] = useState<any | null>(null)
  const [openDetalle, setOpenDetalle] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [reservaSeleccionada, setReservaSeleccionada] = useState<any | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const res = await authFetch(`http://localhost:5000/reservas/ver`)
        if (!res.ok) throw new Error("No se pudieron obtener las reservas")
        const data = await res.json()

        const reservasConVehiculo = await Promise.all(
          data.map(async (reserva: any) => {
            try {
              const vehiculoRes = await authFetch(`http://localhost:5000/vehiculos/${reserva.vehiculo_id}`)
              const vehiculoData = await vehiculoRes.json()
              return {
                ...reserva,
                nombre_vehiculo: `${vehiculoData.marca} ${vehiculoData.modelo}`,
                estado_nombre: reserva.estado || 'Sin estado'
              }
            } catch {
              return { ...reserva, nombre_vehiculo: 'Vehículo desconocido',estado_nombre: reserva.estado || 'Sin estado' }
            }
          })
        )

        reservasConVehiculo.sort((a, b) => {
          if (a.estado_id !== b.estado_id) return a.estado_id - b.estado_id
          return new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
        })

        setReservas(reservasConVehiculo)
      } catch (err) {
        console.error('Error al obtener las reservas:', err)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchReservas()
  }, [navigate])

  const handleVolver = () => navigate("/")

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, idx: number) => {
    setAnchorEls(prev => ({ ...prev, [idx]: event.currentTarget }))
  }

  const handleMenuClose = (idx: number) => {
    setAnchorEls(prev => ({ ...prev, [idx]: null }))
  }

  const handleVerDetalle = (reserva: any) => {
    setDetalleReserva(reserva)
    setOpenDetalle(true)
  }

  const handleCerrarDetalle = () => {
    setOpenDetalle(false)
    setDetalleReserva(null)
  }

  const pedirConfirmacionCancelacion = (reserva: any, idx: number) => {
    setReservaSeleccionada(reserva)
    setSelectedIdx(idx)
    setOpenConfirmDialog(true)
  }

  const confirmarCancelacion = async () => {
    if (!reservaSeleccionada || selectedIdx === null) return

    const reservaId = reservaSeleccionada.id
    const idx = selectedIdx
    const fechaHoy = new Date().toISOString().split("T")[0]
    const reservaYaEmpezo = reservaSeleccionada.fecha_inicio <= fechaHoy
    const yaCancelada = reservaSeleccionada.estado_id === 3

    if (yaCancelada || reservaYaEmpezo) {
      alert("❌ Esta reserva no puede ser cancelada. Ya está cancelada o ya comenzó.")
      setOpenConfirmDialog(false)
      return
    }

    try {
      const res = await authFetch(`http://localhost:5000/reservas/cancelar/${reservaId}`, {
        method: "PUT"
      })
      if (res.ok) {
        const nuevasReservas = [...reservas]
        nuevasReservas[idx].estado_nombre = "Cancelada"
        nuevasReservas[idx].estado_id = 3
        setReservas(nuevasReservas)
        alert("✅ Reserva cancelada correctamente.")
      } else {
        const error = await res.json()
        alert("⚠ Error al cancelar: " + error.error)
      }
    } catch (err) {
      alert("❌ Error inesperado al cancelar la reserva.")
    } finally {
      setOpenConfirmDialog(false)
    }
  }

  const renderEstadoIcono = (estado: string | undefined, fechaFin: string) => {
  if (!estado) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <AccessTimeIcon sx={{ color: '#AAAAAA' }} />
        <Typography>Sin estado</Typography>
      </Box>
    )
  }

  const lowerEstado = estado.toLowerCase()
  const hoy = new Date()
  const fechaFinDate = new Date(fechaFin)

  if (lowerEstado === 'cancelada') {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CancelIcon sx={{ color: '#E74C3C' }} />
        <Typography color="#E74C3C">Cancelada</Typography>
      </Box>
    )
  }

  if (fechaFinDate < hoy && lowerEstado === 'confirmada') {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <TaskAltIcon sx={{ color: '#2ECC71' }} />
        <Typography color="#2ECC71">Finalizada</Typography>
      </Box>
    )
  }

  if (lowerEstado === 'confirmada') {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CheckCircleIcon sx={{ color: '#30BBCB' }} />
        <Typography color="#30BBCB">Confirmada</Typography>
      </Box>
    )
  }

  if (lowerEstado === 'pendiente') {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <AccessTimeIcon sx={{ color: '#F1C40F' }} />
        <Typography color="#F1C40F">Pendiente</Typography>
      </Box>
    )
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <AccessTimeIcon sx={{ color: '#AAAAAA' }} />
      <Typography>Desconocido</Typography>
    </Box>
  )
}


  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, px: 2, py: 4, gap: 3 }}>
      <Box width="100%" maxWidth={800} display="flex" alignItems="center">
        <IconButton onClick={handleVolver} sx={{ color: theme.palette.primary.main, mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>Mis Reservas</Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="secondary" />
        </Box>
      ) : reservas.length > 0 ? (
        reservas.map((reserva, idx) => (
          <Card
            key={idx}
            sx={{ bgcolor: '#2B2645', color: 'white', width: '100%', maxWidth: 800, mb: 2, boxShadow: 3, borderRadius: 3, px: 2, transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'scale(1.02)', boxShadow: 5 } }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">Reserva #{idx + 1}</Typography>
                <IconButton onClick={(e) => handleMenuClick(e, idx)} sx={{ color: '#30BBCB' }}>
                  <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={anchorEls[idx]} open={Boolean(anchorEls[idx])} onClose={() => handleMenuClose(idx)}>
                  <MenuItem onClick={() => handleVerDetalle(reserva)}>Ver Detalle</MenuItem>
                  <MenuItem onClick={() => pedirConfirmacionCancelacion(reserva, idx)}>Cancelar</MenuItem>
                </Menu>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <DirectionsCarIcon fontSize="small" sx={{ color: '#30BBCB' }} />
                <Typography variant="body1">{reserva.nombre_vehiculo}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" flexWrap="wrap" mt={1} gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="#30BBCB">
                    <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Fecha de inicio
                  </Typography>
                  <Typography>{reserva.fecha_inicio}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="#30BBCB">
                    <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Fecha de fin
                  </Typography>
                  <Typography>{reserva.fecha_fin}</Typography>
                </Box>
              </Box>

              <Box mt={2}>
                {renderEstadoIcono(reserva.estado_nombre, reserva.fecha_fin)}
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No se encontraron reservas.</Typography>
      )}

      <Button variant="contained" onClick={handleVolver} sx={{ mt: 4, px: 4, py: 1, fontWeight: 'bold', fontSize: '1rem', bgcolor: '#2B2645', color: '#fff', '&:hover': { bgcolor: '#6C3D8E' } }}>
        Volver al Menú
      </Button>

      {/* Diálogos sin cambios */}
      <Dialog open={openDetalle} onClose={handleCerrarDetalle}>
        <DialogTitle>Detalle de la Reserva</DialogTitle>
        <DialogContent dividers>
          {detalleReserva && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography><strong>Vehículo:</strong> {detalleReserva.nombre_vehiculo}</Typography>
              <Typography><strong>Fecha inicio:</strong> {detalleReserva.fecha_inicio}</Typography>
              <Typography><strong>Fecha fin:</strong> {detalleReserva.fecha_fin}</Typography>
              <Typography><strong>Hora de retiro:</strong> {detalleReserva.hora_retiro || 'No especificada'}</Typography>
              <Typography><strong>Hora de devolución:</strong> {detalleReserva.hora_devolucion || 'No especificada'}</Typography>
              <Typography><strong>Estado:</strong> {detalleReserva.estado_nombre}</Typography>
              <Typography><strong>Pagada:</strong> {detalleReserva.pagada ? 'Sí' : 'No'}</Typography>
              <Typography><strong>Monto total:</strong> ${detalleReserva.monto_total}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarDetalle} color="secondary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>¿Estás seguro que querés cancelar esta reserva?</DialogTitle>
        <DialogContent>
          <Typography>Vehículo: {reservaSeleccionada?.nombre_vehiculo}</Typography>
          <Typography>Fecha: {reservaSeleccionada?.fecha_inicio} a {reservaSeleccionada?.fecha_fin}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="secondary">No</Button>
          <Button onClick={confirmarCancelacion} color="error" variant="contained">Sí, cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}