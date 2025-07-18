// src/pages/VehiclesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryFilter from './CategoryFilter';

interface PoliticaCancelacionDetails {
  id: number;
  descripcion: string;
  penalizacion_dias: number;
  porcentaje_penalizacion: number;
}
interface Sucursal {
  id: number;
  nombre: string;
  localidad: string;
}
interface Vehicle {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad: number;
  categoria: string;
  precio_dia: number;
  sucursal_id: number;
  politica_cancelacion_id: number;
  estado_id: number;
  politica_cancelacion_details: PoliticaCancelacionDetails | null;
}

interface PoliticaCancelacionDetails {
  id: number;
  descripcion: string;
  penalizacion_dias: number;
  porcentaje_penalizacion: number;
}

function VehiclesPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const fechaInicio = params.get('fecha_inicio');
  const fechaFin = params.get('fecha_fin');
  const horaRetiro = params.get('hora_retiro');
  const horaDevolucion = params.get('hora_devolucion');
  const sucursalFromUrl = params.get('sucursal') || '';

  const [sucursalesData, setSucursalesData] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [errorSucursales, setErrorSucursales] = useState<string | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(sucursalFromUrl);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.get('categoria')
  );

  const availableCategories: string[] = [
    'Chico',
    'Mediano',
    'SUV',
    'Deportivo',
    'Van',
    'Apto discapacitados',
  ];

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await fetch('http://localhost:5000/sucursales/all');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: Sucursal[] = await response.json();
        setSucursalesData(data);
      } catch (error: any) {
        console.error('Error al cargar sucursales:', error);
        setErrorSucursales(`No se pudieron cargar las sucursales: ${error.message}`);
      } finally {
        setLoadingSucursales(false);
      }
    };
    fetchSucursales();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSucursalSeleccionada(params.get('sucursal') || '');
  }, [location.search]);

  const handleSucursalChange = (event: SelectChangeEvent<string>) => {
  const value = event.target.value;
  setSucursalSeleccionada(value);

  const params = new URLSearchParams(location.search);
  if (value) {
    params.set('sucursal', value);
  } else {
    params.delete('sucursal');
  }
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
};


  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);

    const params = new URLSearchParams(window.location.search);
    if (category) {
      params.set('categoria', category);
    } else {
      params.delete('categoria');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = 'http://localhost:5000/vehiculos';
        const paramsArr = [];
        if (selectedCategory) paramsArr.push(`categoria=${encodeURIComponent(selectedCategory)}`);
        if (sucursalSeleccionada) paramsArr.push(`sucursal=${encodeURIComponent(sucursalSeleccionada)}`);
        if (paramsArr.length > 0) url += `?${paramsArr.join('&')}`;

        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'No se pudieron cargar los vehículos.');
        }

        const data = await res.json();
        setVehicles(data);
      } catch (err: any) {
        console.error('Error al cargar vehículos:', err);
        setError(err.message || 'Hubo un error al cargar los vehículos.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [selectedCategory, sucursalSeleccionada, location.search]);

  const sucursalNameMap = React.useMemo(() => {
    const map = new Map<number, string>();
    sucursalesData.forEach((s) => map.set(s.id, `${s.nombre} (${s.localidad})`));
    return map;
  }, [sucursalesData]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6">Cargando vehículos...</Typography>
      </Container>
    );
  }

  if (error || errorSucursales) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {errorSucursales && <Alert severity="error">{errorSucursales}</Alert>}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Filtrar por categoría
      </Typography>

      <CategoryFilter
        categories={availableCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <Box sx={{ mt: 3, mb: 4 }}>
        <FormControl sx={{ minWidth: 1018, maxWidth: '100%' }} variant="outlined">
          <InputLabel id="sucursal-label">Sucursal</InputLabel>
          <Select
            labelId="sucursal-label"
            value={sucursalSeleccionada}
            label="Sucursal"
            onChange={handleSucursalChange}
            variant="outlined"
          >
            <MenuItem value="">Seleccione sucursal</MenuItem>
            {sucursalesData.map((sucursalItem) => (
              <MenuItem key={sucursalItem.id} value={sucursalItem.id}>
                {sucursalItem.nombre} - {sucursalItem.localidad}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 4 }}>
        {vehicles.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary">
            No hay vehículos disponibles para esta categoría.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
            {vehicles.map((vehicle) => (
              <Box
                key={vehicle.id}
                sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px', boxShadow: 1 }}
              >
                <Typography variant="h6">
                  {vehicle.marca} {vehicle.modelo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categoría: {vehicle.categoria}
                </Typography>
                <Typography variant="body2">Año: {vehicle.anio}</Typography>
                <Typography variant="body2">Capacidad: {vehicle.capacidad} pasajeros</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sucursal: {sucursalNameMap.get(vehicle.sucursal_id) || 'Desconocida'}
                </Typography>
                <Typography variant="h6" color="secondary" sx={{ mt: 2 }}>
                  ${vehicle.precio_dia} / día
                </Typography>

                {vehicle.politica_cancelacion_details ? (
                  <Accordion sx={{ mt: 2, boxShadow: 'none' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-politica-${vehicle.id}-content`}
                      id={`panel-politica-${vehicle.id}-header`}
                      sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { margin: '8px 0' } }}
                    >
                      <Typography variant="subtitle2" color="secondary.text" sx={{ fontWeight: 'bold' }}>
                        Política de Cancelación
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Descripción: {vehicle.politica_cancelacion_details.descripcion}
                      </Typography>
                      <Typography variant="body2">
                        Días de penalización: {vehicle.politica_cancelacion_details.penalizacion_dias}
                      </Typography>
                      <Typography variant="body2">
                        Porcentaje de penalización: {vehicle.politica_cancelacion_details.porcentaje_penalizacion}%
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Política de cancelación no disponible.
                  </Typography>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  color="secondary"
                  sx={{ mt: 2 }}
                  component={RouterLink}
                  to={`/reservar?vehiculo_id=${vehicle.id}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&hora_retiro=${horaRetiro}&hora_devolucion=${horaDevolucion}`}
                  disabled={!fechaInicio || !fechaFin || !horaRetiro || !horaDevolucion}
                >
                  Reservar
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default VehiclesPage;
