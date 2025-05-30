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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

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

export default function CrearVehiculoForm() {
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
  });

  const [errores, setErrores] = useState<Partial<FormularioVehiculo>>({});
  const [localidades, setLocalidades] = useState<Sucursal[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        const res = await fetch('http://localhost:5000/sucursales');
        const data = await res.json();
        setLocalidades(data);
      } catch (err) {
        console.error('Error al obtener sucursales:', err);
      }
    };
    fetchLocalidades();
  }, []);

const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  let nuevoValor = value;

  if (name === 'patente') {
    nuevoValor = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  } else if (['anio', 'capacidad', 'precio_dia'].includes(name)) {
    nuevoValor = value.replace(/\D/g, ''); // elimina todo lo que no sea número
  }

  setForm((prev) => ({ ...prev, [name]: nuevoValor }));

  if (errores[name as keyof FormularioVehiculo]) {
    setErrores((prev) => ({ ...prev, [name]: '' }));
  }
};


  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errores[name as keyof FormularioVehiculo]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleMarcaChange = (e: SelectChangeEvent) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, marca: value, modelo: '' }));
    if (errores.marca) {
      setErrores((prev) => ({ ...prev, marca: '' }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setErrores({});

    const nuevosErrores: Partial<FormularioVehiculo> = {};
    const anioActual = new Date().getFullYear();

    if (!form.patente) {
      nuevosErrores.patente = 'La patente es obligatoria';
    } else if (!/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/.test(form.patente)) {
      nuevosErrores.patente = 'Formato inválido (ej: ABC123 o AB123CD)';
    }

    if (!form.marca) nuevosErrores.marca = 'La marca es obligatoria';
    if (!form.modelo) nuevosErrores.modelo = 'El modelo es obligatorio';

    if (!form.anio) {
      nuevosErrores.anio = 'El año es obligatorio';
    } else if (!/^\d{4}$/.test(form.anio)) {
      nuevosErrores.anio = 'Debe tener 4 dígitos numéricos';
    } else if (parseInt(form.anio) > anioActual) {
      nuevosErrores.anio = `No puede ser mayor a ${anioActual}`;
    }

    if (!form.capacidad) {
      nuevosErrores.capacidad = 'La capacidad es obligatoria';
    } else if (!/^[1-9][0-9]*$/.test(form.capacidad)) {
      nuevosErrores.capacidad = 'La capacidad debe ser un número entero positivo';
    }
    if (!form.categoria) nuevosErrores.categoria = 'La categoría es obligatoria';
  
    if (!form.precio_dia) {
      nuevosErrores.precio_dia = 'El precio por día es obligatorio';
    } else if (!/^[1-9][0-9]*$/.test(form.precio_dia)) {
      nuevosErrores.precio_dia = 'El precio debe ser un número entero positivo';
    }
    if (!form.localidad) nuevosErrores.localidad = 'La sucursal es obligatoria';
    if (!form.politica_cancelacion) nuevosErrores.politica_cancelacion = 'La política de cancelación es obligatoria';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/vehiculos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.message || 'Error al registrar vehículo');
        setEsError(true);
        return;
      }

      setMensaje(data.message || 'Vehículo creado con éxito');
      setEsError(false);
      setForm({
        patente: '',
        marca: '',
        modelo: '',
        anio: '',
        capacidad: '',
        categoria: '',
        precio_dia: '',
        localidad: '',
        politica_cancelacion: '',
      });
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      setEsError(true);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f2f5" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="primary" fontWeight="bold" gutterBottom>
            Crear Vehículo
          </Typography>

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Patente"
              name="patente"
              value={form.patente}
              onChange={handleTextChange}
              error={Boolean(errores.patente)}
              helperText={errores.patente}
            />
            <FormControl fullWidth error={Boolean(errores.marca)}>
              <InputLabel id="marca">Marca</InputLabel>
              <Select name="marca" label="Marca" labelId="marca" value={form.marca} onChange={handleMarcaChange}>
                {marcas.map((marca) => (
                  <MenuItem key={marca} value={marca}>{marca}</MenuItem>
                ))}
              </Select>
              {errores.marca && <Typography color="error" variant="caption">{errores.marca}</Typography>}
            </FormControl>

            <FormControl fullWidth error={Boolean(errores.modelo)} disabled={!form.marca}>
              <InputLabel id="modelo">Modelo</InputLabel>
              <Select name="modelo" label="Modelo" labelId="modelo" value={form.modelo} onChange={handleSelectChange}>
                {modelosDisponibles.filter((m) => m.marca === form.marca).map((m) => (
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
                {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i).map((a) => (
                  <MenuItem key={a} value={a.toString()}>{a}</MenuItem>
                ))}
              </Select>
              {errores.anio && (
                <Typography color="error" variant="caption">{errores.anio}</Typography>
              )}
            </FormControl>
            <TextField
              label="Capacidad"
              name="capacidad"
              value={form.capacidad}
              onChange={handleTextChange}
              error={Boolean(errores.capacidad)}
              helperText={errores.capacidad}
              inputProps={{
                inputMode: 'numeric',
                maxLength: 1
              }}
            />
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

            <TextField
              label="Precio por día"
              name="precio_dia"
              value={form.precio_dia}
              onChange={handleTextChange}
              error={Boolean(errores.precio_dia)}
              helperText={errores.precio_dia}
              inputProps={{
                inputMode: 'numeric',
                maxLength: 6
              }}
            />

            <FormControl fullWidth error={Boolean(errores.localidad)}>
              <InputLabel>Sucursal</InputLabel>
              <Select name="localidad" label="Sucursal" value={form.localidad} onChange={handleSelectChange}>
                {localidades.map((suc) => (
                  <MenuItem key={suc.id} value={suc.id.toString()}>
                    {suc.nombre} - {suc.localidad}
                  </MenuItem>
                ))}
              </Select>
              {errores.localidad && <Typography color="error" variant="caption">{errores.localidad}</Typography>}
            </FormControl>

            <FormControl fullWidth error={Boolean(errores.politica_cancelacion)}>
              <InputLabel>Política de Cancelación</InputLabel>
              <Select name="politica_cancelacion" label="Politica de Cancelacion" value={form.politica_cancelacion} onChange={handleSelectChange}>
                <MenuItem value="1">100% de devolución</MenuItem>
                <MenuItem value="2">20% de devolución</MenuItem>
                <MenuItem value="3">Sin devolución</MenuItem>
              </Select>
              {errores.politica_cancelacion && (
                <Typography color="error" variant="caption">{errores.politica_cancelacion}</Typography>
              )}
            </FormControl>

            <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}>
              Crear
            </Button>

            {mensaje && (
              <Typography align="center" color={esError ? 'error' : 'success'} mt={2}>
                {mensaje}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
