import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");


const colores = ["#30BBCB", "#9D5FB9", "#5766B2"];

const ReporteSemanal: React.FC = () => {
  const [usuariosPorDia, setUsuariosPorDia] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [vehiculosMas, setVehiculosMas] = useState([]);
  const [vehiculosMenos, setVehiculosMenos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [desde, setDesde] = useState<Dayjs>(dayjs().subtract(7, "day"));
  const [hasta, setHasta] = useState<Dayjs>(dayjs());

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const desdeStr = desde.format("YYYY-MM-DD");
    const hastaStr = hasta.format("YYYY-MM-DD");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const urls = [
        `/usuarios/reporte/registrados-por-dia?desde=${desdeStr}&hasta=${hastaStr}`,
        `/reservas/reporte/reservas-por-dia?desde=${desdeStr}&hasta=${hastaStr}`,
        "/reservas/reporte/vehiculos-mas-reservados",
        "/reservas/reporte/vehiculos-menos-reservados",
        "/reservas/reporte/reservas-por-categoria"
      ];

      const [u, r, vm, vl, c] = await Promise.all(
        urls.map((url) =>
          fetch("http://localhost:5000" + url, { headers }).then((res) => res.json())
        )
      );

      setUsuariosPorDia(u);
      setReservasPorDia(r);
      setVehiculosMas(vm);
      setVehiculosMenos(vl);
      setCategorias(c);
    } catch (error) {
      console.error("Error al cargar datos del reporte semanal:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Reporte General de la App
      </Typography>

      <Box display="flex" gap={2} alignItems="center" my={2}>
        <TextField
          label="Desde"
          type="date"
          value={desde.format("YYYY-MM-DD")}
          onChange={(e) => setDesde(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Hasta"
          type="date"
          value={hasta.format("YYYY-MM-DD")}
          onChange={(e) => setHasta(dayjs(e.target.value))}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchData}>
          Actualizar
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Usuarios registrados por día</Typography>
              {usuariosPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usuariosPorDia}>
                    <XAxis dataKey="dia" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="cantidad" stroke="#30BBCB" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No hay datos disponibles.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reservas por día</Typography>
              {reservasPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reservasPorDia}>
                    <XAxis dataKey="dia" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#5766B2" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No hay datos disponibles.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vehículos más reservados</Typography>
              {vehiculosMas.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehiculosMas} layout="vertical">
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="modelo" type="category" />
                    <Tooltip />
                    <Bar dataKey="reservas" fill="#9D5FB9" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No hay datos disponibles.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vehículos menos reservados</Typography>
              {vehiculosMenos.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehiculosMenos} layout="vertical">
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="modelo" type="category" />
                    <Tooltip />
                    <Bar dataKey="reservas" fill="#B25E5E" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No hay datos disponibles.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reservas por categoría de vehículo</Typography>
              {categorias.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categorias}
                      dataKey="porcentaje"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No hay datos disponibles.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReporteSemanal;