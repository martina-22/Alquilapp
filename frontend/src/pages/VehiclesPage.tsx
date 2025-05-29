// src/pages/VehiclesPage.tsx
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryFilter from '../components/CategoryFilter';
import { useLocation } from 'react-router-dom';

interface PoliticaCancelacionDetails {
  id: number;
  descripcion: string;
  penalizacion_dias: number;
  porcentaje_penalizacion: number;
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

function VehiclesPage() {
  const location = useLocation();

  const getInitialCategory = () => {
    const params = new URLSearchParams(location.search);
    return params.get('categoria');
  };

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(getInitialCategory());

  const availableCategories: string[] = [
    "Chico",
    "Mediano",
    "SUV",
    "Deportivo",
    "Van",
    "Apto discapacitados",
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = 'http://localhost:5000/vehiculos';

        if (selectedCategory) {
          url = `http://localhost:5000/vehiculos?categoria=${encodeURIComponent(selectedCategory)}`;
        }

        const res = await fetch(url, {
          // headers: { /* ... */ }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'No se pudieron cargar los vehículos.');
        }

        const data = await res.json();
        setVehicles(data);
      } catch (err: any) {
        console.error("Error al cargar vehículos:", err);
        setError(err.message || 'Hubo un error al cargar los vehículos.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [selectedCategory, location.search]);

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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6">Cargando vehículos...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
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

      <Box sx={{ mt: 4 }}>
        {vehicles.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary">
            No hay vehículos disponibles para esta categoría.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
            {vehicles.map((vehicle) => (
              <Box key={vehicle.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px', boxShadow: 1 }}>
                <Typography variant="h6">{vehicle.marca} {vehicle.modelo}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Categoría: {vehicle.categoria}
                </Typography>
                <Typography variant="body2">Año: {vehicle.anio}</Typography>
                <Typography variant="body2">Capacidad: {vehicle.capacidad} pasajeros</Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  ${vehicle.precio_dia} / día
                </Typography>

                {/* Sección de la Política de Cancelación Desplegable */}
                {vehicle.politica_cancelacion_details ? (
                  <Accordion sx={{ mt: 2, boxShadow: 'none', '&:before': { display: 'none' }, borderRadius: 'px' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-politica-${vehicle.id}-content`}
                      id={`panel-politica-${vehicle.id}-header`}
                      sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { margin: '8px 0' } }}
                    >
                      <Typography variant="subtitle2" color="primary.text" sx={{ fontWeight: 'bold' }}>
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
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => alert(`Reservar vehículo ${vehicle.id} funcionalidad no implementada`)}
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