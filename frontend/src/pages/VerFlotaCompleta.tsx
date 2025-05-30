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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Vehiculo {
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  matricula: string;
  localidad: string;
  localidad_nombre: string;  // <- agregado
  capacidad: number;
  politica_cancelacion: string;
  precio_por_dia: number;
  estado: string;
  estado_nombre: string;     // <- agregado
}

export default function VerFlotaCompleta() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [agrupado, setAgrupado] = useState<Record<string, Record<string, Vehiculo[]>>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/vehiculos/flota')
      .then((res) => res.json())
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
      if (!agrupado[v.marca]) {
        agrupado[v.marca] = {};
      }
      if (!agrupado[v.marca][v.modelo]) {
        agrupado[v.marca][v.modelo] = [];
      }
      agrupado[v.marca][v.modelo].push(v);
    });

    setAgrupado(agrupado);
  };

  return (
    <Box bgcolor="#f0f2f5" minHeight="100vh" p={4}>
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        Flota de Vehículos
      </Typography>

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
