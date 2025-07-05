import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useLocation, useNavigate } from 'react-router-dom';

interface FormularioVehiculo {
  patente: string;
  marca: string;
  modelo: string;
  anio: string;
  capacidad: string;
  categoria: string;
  precio_dia: string;
  localidad: string;
  politica_cancelacion: string;
  estado: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  localidad: string;
}

const marcas = ["Fiat", "Ford", "Chevrolet", "Peugeot", "Toyota", "Volkswagen"];
const modelosDisponibles = [
  { marca: "Fiat", modelo: "Cronos" },
  { marca: "Fiat", modelo: "Toro" },
  { marca: "Fiat", modelo: "Strada" },
  { marca: "Fiat", modelo: "Palio" },
  { marca: "Fiat", modelo: "Uno" },

  { marca: "Ford", modelo: "Ranger" },
  { marca: "Ford", modelo: "Ka" },
  { marca: "Ford", modelo: "EcoSport" },
  { marca: "Ford", modelo: "Focus" },
  { marca: "Ford", modelo: "Fiesta" },

  { marca: "Chevrolet", modelo: "Onix" },
  { marca: "Chevrolet", modelo: "Tracker" },
  { marca: "Chevrolet", modelo: "Cruze" },
  { marca: "Chevrolet", modelo: "S10" },
  { marca: "Chevrolet", modelo: "Spin" },

  { marca: "Peugeot", modelo: "208" },
  { marca: "Peugeot", modelo: "2008" },
  { marca: "Peugeot", modelo: "Partner" },
  { marca: "Peugeot", modelo: "308" },
  { marca: "Peugeot", modelo: "3008" },

  { marca: "Toyota", modelo: "Hilux" },
  { marca: "Toyota", modelo: "Yaris" },
  { marca: "Toyota", modelo: "Corolla" },
  { marca: "Toyota", modelo: "Etios" },
  { marca: "Toyota", modelo: "SW4" },

  { marca: "Volkswagen", modelo: "Gol" },
  { marca: "Volkswagen", modelo: "Amarok" },
  { marca: "Volkswagen", modelo: "Vento" },
  { marca: "Volkswagen", modelo: "T-Cross" },
  { marca: "Volkswagen", modelo: "Saveiro" },
];


export default function ModificarVehiculoForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const patente = (location.state as { patente: string })?.patente;

  const [form, setForm] = useState<FormularioVehiculo>({
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    capacidad: '',
    categoria: '',
    precio_dia: '',
    localidad: '',
    politica_cancelacion: '',
    estado: '',
  });

  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([]);
  const [localidades, setLocalidades] = useState<Sucursal[]>([]);
  const [errores, setErrores] = useState<Partial<FormularioVehiculo>>({});
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patente) {
      setMensaje('Matrícula no especificada');
      setEsError(true);
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const [vehiculoRes, sucursalesRes, estadosRes] = await Promise.all([
          fetch(`http://localhost:5000/vehiculos/${patente}`),
          fetch('http://localhost:5000/sucursales'),
          fetch('http://localhost:5000/vehiculos/estados'),
        ]);

        if (!vehiculoRes.ok) throw new Error('Error al obtener el vehículo');
        if (!sucursalesRes.ok) throw new Error('Error al obtener las sucursales');
        if (!estadosRes.ok) throw new Error('Error al obtener los estados');

        const vehiculoData = await vehiculoRes.json();
        const sucursalesData = await sucursalesRes.json();
        const estadosData = await estadosRes.json();

        setForm(vehiculoData);
        setLocalidades(sucursalesData);
        setEstados(estadosData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMensaje('Error al cargar los datos');
        setEsError(true);
        setLoading(false);
      }
    };

    cargarDatos();
  }, [patente]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let nuevoValor = value;
    if (name === 'patente') nuevoValor = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    else if (['anio', 'capacidad', 'precio_dia'].includes(name)) nuevoValor = value.replace(/\D/g, '');
    setForm(prev => ({ ...prev, [name]: nuevoValor }));
    if (errores[name as keyof FormularioVehiculo]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof FormularioVehiculo]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handleMarcaChange = (e: SelectChangeEvent) => {
    const { value } = e.target;
    setForm(prev => ({ ...prev, marca: value, modelo: '' }));
    if (errores.marca) setErrores(prev => ({ ...prev, marca: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setErrores({});

    const nuevosErrores: Partial<FormularioVehiculo> = {};
    const anioActual = new Date().getFullYear();

    if (!form.patente) nuevosErrores.patente = 'La patente es obligatoria';
    else if (!/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/.test(form.patente)) nuevosErrores.patente = 'Formato inválido (ej: ABC123 o AB123CD)';
    if (!form.marca) nuevosErrores.marca = 'La marca es obligatoria';
    if (!form.modelo) nuevosErrores.modelo = 'El modelo es obligatorio';

    if (!form.anio) nuevosErrores.anio = 'El año es obligatorio';
    else if (!/^\d{4}$/.test(form.anio)) nuevosErrores.anio = 'Debe tener 4 dígitos numéricos';
    else if (parseInt(form.anio) > anioActual) nuevosErrores.anio = `No puede ser mayor a ${anioActual}`;

    if (!form.capacidad) nuevosErrores.capacidad = 'La capacidad es obligatoria';
    else if (!/^[1-9][0-9]*$/.test(form.capacidad)) nuevosErrores.capacidad = 'Debe ser un número positivo';

    if (!form.categoria) nuevosErrores.categoria = 'La categoría es obligatoria';

    if (!form.precio_dia) nuevosErrores.precio_dia = 'El precio por día es obligatorio';
    else if (!/^[1-9][0-9]*$/.test(form.precio_dia)) nuevosErrores.precio_dia = 'Debe ser un número positivo';

    if (!form.localidad) nuevosErrores.localidad = 'La sucursal es obligatoria';
    if (!form.politica_cancelacion) nuevosErrores.politica_cancelacion = 'La política de cancelación es obligatoria';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // 🔹 OBTENER TOKEN DEL LOCALSTORAGE Y VALIDARLO
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('No se encontró un token de sesión. Por favor inicia sesión nuevamente.');
      setEsError(true);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/vehiculos/modificar/${patente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ ahora sí enviamos el token
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.error || 'Error al modificar el vehículo');
        setEsError(true);
        return;
      }

      setMensaje(data.message || 'Vehículo modificado con éxito');
      setEsError(false);
      setTimeout(() => navigate('/ver-flota'), 2000);
    } catch (error) {
      console.error(error);
      setMensaje('Error de conexión con el servidor');
      setEsError(true);
    }
  };


  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f2f5" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="secondary" fontWeight="bold" gutterBottom>
            Modificar Vehículo
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField label="Patente" name="patente" value={form.patente} onChange={handleTextChange} error={!!errores.patente} helperText={errores.patente} />
              <FormControl fullWidth error={!!errores.marca}>
                <InputLabel>Marca</InputLabel>
                <Select name="marca" label="Marca" value={form.marca} onChange={handleMarcaChange}>
                  {marcas.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
                {errores.marca && <Typography color="error" variant="caption">{errores.marca}</Typography>}
              </FormControl>

              <FormControl fullWidth error={!!errores.modelo} disabled={!form.marca}>
                <InputLabel>Modelo</InputLabel>
                <Select name="modelo" label="Modelo" value={form.modelo} onChange={handleSelectChange}>
                  {modelosDisponibles.filter(m => m.marca === form.marca).map(m => (
                    <MenuItem key={m.modelo} value={m.modelo}>{m.modelo}</MenuItem>
                  ))}
                </Select>
                {errores.modelo && <Typography color="error" variant="caption">{errores.modelo}</Typography>}
              </FormControl>

              <FormControl fullWidth error={!!errores.anio}>
                <InputLabel id="anio-label">Año</InputLabel>
                <Select
                  labelId="anio-label"
                  name="anio"
                  value={form.anio}
                  onChange={handleSelectChange}
                  label="Año"
                >
                  {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i)
                    .reverse() // opcional, para mostrar los años del más nuevo al más viejo
                    .map((a) => (
                      <MenuItem key={a} value={a.toString()}>{a}</MenuItem>
                    ))}
                </Select>
                {errores.anio && (
                  <Typography color="error" variant="caption">{errores.anio}</Typography>
                )}
              </FormControl>

              <TextField label="Capacidad" name="capacidad" value={form.capacidad} onChange={handleTextChange} error={!!errores.capacidad} helperText={errores.capacidad} />
              <FormControl fullWidth error={Boolean(errores.categoria)}>
              <InputLabel>Categoría</InputLabel>
                <Select name="categoria" label="Categoria" value={form.categoria} onChange={handleSelectChange}>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Apto discapacitado">Apto discapacitado</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Deportivo">Deportivo</MenuItem>
                  <MenuItem value="Chico">Chico</MenuItem>
                  <MenuItem value="Mediano">Mediano</MenuItem>
                </Select>
                {errores.categoria && (
                  <Typography color="error" variant="caption">{errores.categoria}</Typography>
                )}
              </FormControl>

              <TextField label="Precio por día" name="precio_dia" value={form.precio_dia} onChange={handleTextChange} error={!!errores.precio_dia} helperText={errores.precio_dia} />

              <FormControl fullWidth error={!!errores.localidad}>
                <InputLabel>Sucursal</InputLabel>
                <Select name="localidad" label="Sucursal" value={form.localidad} onChange={handleSelectChange}>
                  {localidades.map(s => (
                    <MenuItem key={s.id} value={s.id.toString()}>{s.nombre} - {s.localidad}</MenuItem>
                  ))}
                </Select>
                {errores.localidad && <Typography color="error" variant="caption">{errores.localidad}</Typography>}
              </FormControl>

              <FormControl fullWidth error={!!errores.politica_cancelacion}>
                <InputLabel>Política de Cancelación</InputLabel>
                <Select name="politica_cancelacion" label="Politica de Cancelacion" value={form.politica_cancelacion} onChange={handleSelectChange}>
                  <MenuItem value="1">100% de devolución</MenuItem><MenuItem value="2">20% de devolución</MenuItem><MenuItem value="3">Sin devolución</MenuItem>
                </Select>
                {errores.politica_cancelacion && <Typography color="error" variant="caption">{errores.politica_cancelacion}</Typography>}
              </FormControl>

              <FormControl fullWidth error={!!errores.estado}>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  label="Estado"
                  value={form.estado}
                  onChange={handleSelectChange}
                >
                  {estados.map(e => (
                    <MenuItem key={e.id} value={e.id.toString()}>{e.nombre}</MenuItem>
                  ))}
                </Select>
                {errores.estado && (
                  <Typography color="error" variant="caption">{errores.estado}</Typography>
                )}
              </FormControl>


              <Button type="submit" variant="contained" color="secondary" sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}>
                Guardar Cambios
              </Button>

              {mensaje && (
                <Typography align="center" color={esError ? 'error' : 'success'} mt={2}>{mensaje}</Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
