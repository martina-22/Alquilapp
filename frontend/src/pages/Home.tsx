// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import BannerSection from "../styles/Banner";

// Importaciones de Material-UI
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  type SelectChangeEvent,
  Alert, // Importa Alert para mostrar errores
} from "@mui/material";

import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';

// Importaciones del DatePicker de MUI X
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

// Importa react-slick y sus estilos
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Importa los iconos de Material-UI para las flechas
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';


// Componente FAQItem refactorizado con MUI
type FaqItemProps = {
  pregunta: string;
  respuesta: string;
};

const FaqItem: React.FC<FaqItemProps> = ({ pregunta, respuesta }) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 2,
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.secondary',
        border: '1px solid',
        borderColor: 'grey.300',
      }}
      onClick={() => setAbierto(!abierto)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="body1">{pregunta}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {abierto ? "▲" : "▼"}
        </Typography>
      </Box>
      {abierto && (
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {respuesta}
        </Typography>
      )}
    </Paper>
  );
};

// Componente para la flecha "Siguiente"
const NextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <Box
      className={className}
      sx={{
        ...style,
        display: "block",
        right: { xs: "0px", md: "-25px" },
        zIndex: 1,
        "&:before": {
          content: '""',
        },
      }}
      onClick={onClick}
    >
      <ArrowForwardIosIcon
        sx={{
          color: '#5DC4D2',
          fontSize: { xs: 30, md: 40 },
        }}
      />
    </Box>
  );
};

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <Box
      className={className}
      sx={{
        ...style,
        display: "block",
        left: { xs: "0px", md: "-25px" },
        zIndex: 1,
        "&:before": {
          content: '""',
        },
      }}
      onClick={onClick}
    >
      <ArrowBackIosIcon
        sx={{
          color: '#5DC4D2',
          fontSize: { xs: 30, md: 40 },
        }}
      />
    </Box>
  );
};

// Define el tipo para los datos de sucursales
interface Sucursal {
  id: number;
  nombre: string;
  localidad: string;
  direccion: string;
  telefono: string;
  imagen_url?: string; // Opcional si no todas tienen imagen
}


const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [fechaRetiro, setFechaRetiro] = useState<Dayjs | null>(null);
  const [fechaDevolucion, setFechaDevolucion] = useState<Dayjs | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(''); // Renombrado para evitar conflicto
  const [horaRetiro, setHoraRetiro] = useState('');
  const [horaDevolucion, setHoraDevolucion] = useState('');

  // Nuevos estados para las sucursales dinámicas
  const [sucursalesData, setSucursalesData] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [errorSucursales, setErrorSucursales] = useState<string | null>(null);
  const [logueado, setLogueado] = useState(false);
  const faqs = [
    {
      pregunta: "¿Puedo devolver el vehículo en una sucursal diferente?",
      respuesta: "Sí, podés devolverlo en otra sucursal, siempre que esté habilitada en el sistema. Esto puede tener un costo adicional."
    },
    {
      pregunta: "¿Qué documentos necesito para alquilar un auto?",
      respuesta: "Necesitás presentar tu DNI, una licencia de conducir válida y el QR de la reserva."
    },
    {
      pregunta: "¿La política de cancelación es la misma para todos los autos?",
      respuesta: "No, cada auto tiene su propia política de cancelación."
    },
    { pregunta: "¿Que se hace si el auto se daña durante el alquiler?",
      respuesta: "Se debe informar inmediatamente a la empresa."
    }
  ];

  const categories = [
    "Chico",
    "Mediano",
    "SUV",
    "Deportivo",
    "Van",
    "Apto discapacitados",
  ];

  const handleCategoryClick = (category: string) => {
    // Navega a la página de vehículos, pasando la categoría como un parámetro de consulta
    // Por ejemplo, '/vehiculos?categoria=Mediano'
    navigate(`/vehiculos?categoria=${encodeURIComponent(category)}`);
  };

  const handleSucursalChange = (event: SelectChangeEvent<string>) => {
    setSucursalSeleccionada(event.target.value as string); // Actualiza el estado con la sucursal seleccionada
  };

  // Configuración del carrusel para react-slick
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0
        }
      }
    ]
  };

  // useEffect para cargar las sucursales al montar el componente
  
 useEffect(() => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  setLogueado(Boolean(token));

  if (token && rol === 'admin') {
    navigate('/ver-flota'); // ⬅️ Cambiar por la que use el admin
  }
}, [navigate]);


// useEffect para cargar sucursales
useEffect(() => {
  const fetchSucursales = async () => {
    try {
      const response = await fetch('http://localhost:5000/sucursales/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Sucursal[] = await response.json();
      setSucursalesData(data);
    } catch (error: any) {
      console.error("Error al cargar sucursales:", error);
      setErrorSucursales(`No se pudieron cargar las sucursales: ${error.message}`);
    } finally {
      setLoadingSucursales(false);
    }
  };

  fetchSucursales();
}, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" color="inherit" elevation={1}>
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: { xs: 1, md: 2 } }}>
            <Box component="img" src="src/assets/logo.png" alt="AlquilApp Car" sx={{ height: { xs: 150, md: 150 } }} />
            <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 0.8,
            }}
          >
            {!logueado ? (
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/login"
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  width: '140px',
                  whiteSpace: 'nowrap',      
                  overflow: 'hidden',          
                }}
              >
                Iniciar sesión
              </Button>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 1 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      px: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      width: '140px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                    component={RouterLink}
                    to="/verreservas"
                  >
                    Ver reservas
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      px: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      width: '140px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                    component={RouterLink}
                    to="/profile"
                  >
                    Ver perfil
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    width: '140px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario_id');
                    setLogueado(false);
                    navigate('/logout');
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            )}
          </Box>

          </Toolbar>
        </AppBar>

        {/* Contenedor central */}
        <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 6 } }}>
          {/* Reservá tu auto */}
          <Box sx={{ my: { xs: 4, md: 6 } }}>
            <Typography variant="h4" component="h2" align="center" sx={{ mb: { xs: 3, md: 4 }, fontWeight: 'bold', color: 'text.secondary' }}>
              Reservá tu auto
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: 'center',
              }}
            >
              {/* Sucursal */}
              <Box
                sx={{
                  width: { xs: '100%', md: 'calc(33.333% - 1.5rem)' },
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="sucursal-label">Sucursal</InputLabel>
                  <Select
                    labelId="sucursal-label"
                    value={sucursalSeleccionada} // Usa el nuevo estado
                    label="Sucursal"
                    onChange={handleSucursalChange}
                    variant="outlined"
                  >
                    <MenuItem value="">Seleccione sucursal</MenuItem>
                    {/* Renderiza las sucursales obtenidas de la API */}
                    {sucursalesData.map((sucursalItem) => (
                      <MenuItem key={sucursalItem.id} value={sucursalItem.id}>
                        {sucursalItem.nombre} - {sucursalItem.localidad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {/* Fecha de retiro*/}
              <Box
                sx={{
                  width: { xs: '100%', md: 'calc(33.333% - 1.5rem)',backgroundColor: '#fff' },
                }}
              >
                <DatePicker
                  label="Fecha de retiro"
                  value={fechaRetiro}
                  onChange={(newValue) => setFechaRetiro(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </Box>
              {/* Fecha de devolución*/}
              <Box
                sx={{
                  width: { xs: '100%', md: 'calc(33.333% - 1.5rem)' },backgroundColor: '#fff'
                }}
              >
                <DatePicker
                  label="Fecha de devolución"
                  value={fechaDevolucion}
                  onChange={(newValue) => setFechaDevolucion(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </Box>
              {/* Hora Retiro */}
              <Box
                sx={{
                  width: { xs: '100%', md: 'calc(50% - 1.5rem)' },
                }}
              >
                <TextField
                  fullWidth
                  label="Hora Retiro"
                  type="time"
                  value={horaRetiro}
                  onChange={(e) => setHoraRetiro(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Box>
              {/* Hora Devolución*/}
              <Box
                sx={{
                  width: { xs: '100%', md: 'calc(50% - 1.5rem)' },
                }}
              >
                <TextField
                  fullWidth
                  label="Hora Devolución"
                  type="time"
                  value={horaDevolucion}
                  onChange={(e) => setHoraDevolucion(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ my: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          component={RouterLink}
          to={`/VehiculosDisponibles?sucursal=${encodeURIComponent(sucursalSeleccionada)}&fecha_inicio=${fechaRetiro?.format('YYYY-MM-DD')}&fecha_fin=${fechaDevolucion?.format('YYYY-MM-DD')}&hora_retiro=${horaRetiro}&hora_devolucion=${horaDevolucion}`}
          sx={{ width: { xs: '100%', sm: 256 }, py: 1.5, fontWeight: 'bold' }}
          disabled={!sucursalSeleccionada || !fechaRetiro || !fechaDevolucion || !horaRetiro || !horaDevolucion}
        >
          Buscar
        </Button>

      </Box>
        </Container> {/* CIERRE DEL CONTAINER PRINCIPAL ANTES DEL BANNER */}

        <Box sx={{ my: { xs: 2, md: -7 } }}> {/* Agrega márgenes para separarlo */}
          <BannerSection />
        </Box>

        {/* VOLVEMOS A ABRIR EL CONTAINER PARA EL RESTO DE LOS ELEMENTOS */}
        <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>

          {/* Filtros por categoría */}
          <Box sx={{ my: { xs: 4, md: 6 } }}>
            <Typography variant="h5" component="h3" align="center" sx={{ mb: { xs: 3, md: 4 }, fontWeight: 'bold', color: 'text.secondary' }}>
              Filtrar por categoría
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: { xs: 1, md: 1.5 }, mt: 2 }}>
              {categories.map((cat, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  color="secondary"
                  sx={{ borderColor: 'secondary.main', color: 'text.secondary', '&:hover': { bgcolor: 'secondary.main' } }}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Sucursales - CARRUSEL */}
          <Box sx={{ my: { xs: 4, md: 6 } }}>
            <Typography variant="h5" component="h3" align="center" sx={{ mb: { xs: 3, md: 4 }, fontWeight: 'bold', color: 'text.secondary' }}>
              Nuestras sucursales
            </Typography>
            <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
              {loadingSucursales && (
                <Typography align="center">Cargando sucursales...</Typography>
              )}
              {errorSucursales && (
                <Alert severity="error" sx={{ my: 2, mx: 'auto', width: 'fit-content' }}>
                  {errorSucursales}
                </Alert>
              )}
              {!loadingSucursales && !errorSucursales && sucursalesData.length > 0 ? (
                <Slider {...settings}>
                  {sucursalesData.map((sucursalItem: Sucursal) => (
                    <Box key={sucursalItem.id} sx={{ p: 1 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          minWidth: { xs: 150, sm: 200 },
                          textAlign: 'center',
                          p: 2.5,
                          borderRadius: '8px',
                          bgcolor: 'secondary.main',
                          color: '#ffff',
                          fontWeight: 'medium',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s',
                          '&:hover': {
                            boxShadow: 6,
                            bgcolor: 'secondary.dark',
                          },
                        }}
                        onClick={() => navigate(`/vehiculos?sucursal=${sucursalItem.id}`)}
                      >
                        <Typography variant="h6">{sucursalItem.nombre}</Typography>
                        <Typography variant="body2">{sucursalItem.localidad}</Typography>
                        <Typography variant="body2">{sucursalItem.direccion}</Typography>
                        {/* Añadir imagen luego */}
                        {sucursalItem.imagen_url && (
                          <Box component="img"
                            src={sucursalItem.imagen_url}
                            alt={`Imagen de ${sucursalItem.nombre}`}
                            sx={{
                              maxWidth: '100%',
                              height: '100px', // Altura fija para uniformidad
                              objectFit: 'cover',
                              marginTop: '10px',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                      </Paper>
                    </Box>
                  ))}
                </Slider>
              ) : (
                !loadingSucursales && !errorSucursales && sucursalesData.length === 0 && (
                  <Typography align="center" sx={{ my: 2 }}>No hay sucursales disponibles.</Typography>
                )
              )}
            </Box>
          </Box>

          {/* Preguntas frecuentes */}
          <Box sx={{ my: { xs: 4, md: 6 } }}>
            <Typography variant="h5" component="h3" align="center" sx={{ mb: { xs: 3, md: 4 }, fontWeight: 'bold', color: 'text.secondary' }}>
              Preguntas frecuentes
            </Typography>
            <Box sx={{ maxWidth: 'md', mx: 'auto', mt: 2 }}>
              {faqs.map((item, idx) => (
                <FaqItem key={idx} pregunta={item.pregunta} respuesta={item.respuesta} />
              ))}
            </Box>
          </Box>
        </Container> {/* CIERRE FINAL DEL CONTAINER */}

        {/* BANNER DE ABAJO - Sección "Contacto" */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            // padding horizontal para definir la "indentación" de todos los elementos internos
            px: { xs: 2, md: 4 },
            py: { xs: 1, md: 2 },
            bgcolor: 'secondary.main',
          }}
        >
          {/* Título "Contacto" */}
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: { xs: 1, md: 1 } }}>
            Contacto
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
            ¿Tenés dudas? ¡Contactanos!
          </Typography>

          {/* Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ color: 'white' }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                AlquilAppCar@gmail.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InstagramIcon sx={{ color: 'white' }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                @Alquilappcar.ok
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: 'white' }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                +54 9 1122334455
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default HomePage;