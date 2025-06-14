import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';

interface Vehiculo {
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  matricula: string;
  localidad: string;
  localidad_nombre: string;
  capacidad: number;
  politica_cancelacion: string;
  precio_por_dia: number;
  estado: string;
  estado_nombre: string;
}

export default function VerFlotaCompleta() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [agrupado, setAgrupado] = useState<Record<string, Record<string, Vehiculo[]>>>({});
  const [error, setError] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/vehiculos/flota')
      .then((res) => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
      })
      .then((data) => {
        if (data.vehiculos) {
          setVehiculos(data.vehiculos);
          agruparPorMarcaYModelo(data.vehiculos);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  const agruparPorMarcaYModelo = (vehiculos: Vehiculo[]) => {
    const agrupado: Record<string, Record<string, Vehiculo[]>> = {};
    vehiculos.forEach((v) => {
      if (!agrupado[v.marca]) agrupado[v.marca] = {};
      if (!agrupado[v.marca][v.modelo]) agrupado[v.marca][v.modelo] = [];
      agrupado[v.marca][v.modelo].push(v);
    });
    setAgrupado(agrupado);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setVehiculoSeleccionado(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_id');
    navigate('/login');
  };

  return (
    <Box bgcolor="#f0f2f5" minHeight="100vh" p={4} position="relative">
      {/* Botones a la izquierda */}
      <Box position="absolute" top={16} left={16} display="flex" gap={2}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/profile')}>
          Ver perfil
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Box>

      {/* Botón desplegable en la esquina superior derecha */}
      <Box position="absolute" top={16} right={16}>
        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Título */}
      <Typography variant="h4" color="secondary" align="center" gutterBottom>
        Flota de Vehículos
      </Typography>

      {/* Menú de acciones */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { navigate('/crear-vehiculo'); handleClose(); }}>Crear nuevo</MenuItem>
        <MenuItem onClick={() => { navigate('/modificar-vehiculo'); handleClose(); }}>Modificar</MenuItem>
        <MenuItem onClick={() => { navigate('/eliminar-vehiculo'); handleClose(); }}>Eliminar</MenuItem>
      </Menu>

      {error ? (
        <Typography align="center" color="error">
          Error al cargar la flota.
        </Typography>
      ) : (
        Object.entries(agrupado).map(([marca, modelos]) => (
          <Accordion key={marca} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{marca}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {Object.entries(modelos).map(([modelo, vehiculosModelo]) => (
                <Accordion key={modelo} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      {modelo} ({vehiculosModelo.length} {vehiculosModelo.length === 1 ? 'unidad' : 'unidades'})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {vehiculosModelo.map((v, i) => (
                        <Grid item xs={12} md={6} key={i}>
                          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                Año: {v.anio} | Matrícula: {v.matricula}
                              </Typography>
                              <Typography>Capacidad: {v.capacidad}</Typography>
                              <Typography>Sucursal: {v.localidad_nombre}</Typography>
                              <Typography>Estado: {v.estado_nombre}</Typography>
                              <Typography>Categoría: {v.tipo}</Typography>
                              <Typography>Precio por día: ${v.precio_por_dia}</Typography>
                              <Typography>Política: {v.politica_cancelacion}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}
