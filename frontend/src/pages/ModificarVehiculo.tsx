import { useState, useEffect, useRef } from 'react';
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

interface Sucursal {
  id: number;
  nombre: string;
  localidad: string;
}

interface Vehiculo {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad: number;
  categoria: string;
  precio_por_dia: number;
  localidad: number;
  politica_cancelacion: number;
  estado: number;
  tipo: string;
}

const marcasModelos: Record<string, string[]> = {
  "Fiat": ["Siena", "Cronos", "Argo", "Pulse", "Toro"],
  "Chevrolet": ["Onix", "Prisma", "Tracker", "Cruze", "S10"],
  "Ford": ["Ka", "Fiesta", "Focus", "EcoSport", "Ranger"],
  "Volkswagen": ["Gol", "Virtus", "Polo", "T-Cross", "Amarok"],
  "Renault": ["Kwid", "Sandero", "Stepway", "Duster", "Alaskan"],
  "Peugeot": ["208", "308", "2008", "Partner", "Expert"],
  "Toyota": ["Etios", "Corolla", "Yaris", "Hilux", "SW4"],
  "Citroën": ["C3", "C4 Lounge", "C-Elysée", "Berlingo"],
  "Nissan": ["March", "Versa", "Kicks", "Frontier"],
  "Honda": ["Fit", "City", "Civic", "HR-V"],
};

export default function ModificarVehiculoForm() {
  const [form, setForm] = useState({
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
  const [camposAutocompletados, setCamposAutocompletados] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [localidades, setLocalidades] = useState<Sucursal[]>([]);
  const [modelosDisponibles, setModelosDisponibles] = useState<string[]>([]);
  const [mensajeBusqueda, setMensajeBusqueda] = useState('');
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [esCargaDesdeBackend, setEsCargaDesdeBackend] = useState(false);
  const modeloSelectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await fetch('http://localhost:5000/sucursales');
        const data = await res.json();
        setLocalidades(data);
      } catch (err) {
        console.error('Error al obtener sucursales:', err);
      }
    };
    fetchSucursales();
  }, []);

  useEffect(() => {
    if (form.marca && marcasModelos[form.marca]) {
      setModelosDisponibles(marcasModelos[form.marca]);
      if (!esCargaDesdeBackend) {
        setForm((prev) => ({ ...prev, modelo: '' }));
      } else {
        setEsCargaDesdeBackend(false);
      }
      setTimeout(() => modeloSelectRef.current?.focus(), 100);
    } else {
      setModelosDisponibles([]);
    }
  }, [form.marca]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  let nuevoValor = value;

  if (name === 'anio' || name === 'capacidad' || name === 'precio_dia') {
    nuevoValor = value.replace(/[^0-9]/g, '');
  }

  if (name === 'patente') {
    nuevoValor = value.toUpperCase();
  }

  setForm((prev) => ({ ...prev, [name]: nuevoValor }));
  setErrores((prev) => ({ ...prev, [name]: '' }));
};


  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name;
    const value = e.target.value;
    setForm((prev) => {
      if (name === 'marca') {
        return { ...prev, marca: value, modelo: '' };
      }
      return { ...prev, [name]: value };
    });
    setErrores((prev) => ({ ...prev, [name]: '' }));
  };

  const validarCampos = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!form.patente) {
      nuevosErrores.patente = 'La patente es obligatoria';
    } else if (!/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/.test(form.patente)) {
      nuevosErrores.patente = 'Formato inválido. Ejemplo: ABC123 o AB123CD';
    }
    if (!form.marca) nuevosErrores.marca = 'La marca es obligatoria';
    if (!form.modelo) nuevosErrores.modelo = 'El modelo es obligatorio';
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
    if (!form.estado) nuevosErrores.estado = 'El estado es obligatorio';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleBuscarVehiculo = async () => {
      const patenteBuscada = form.patente.trim().toUpperCase();

  const formatoValido = /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/.test(patenteBuscada);

  if (!formatoValido) {
    setMensajeBusqueda('Formato inválido. Ejemplo válido: ABC123 o AB123CD');
    setMensajeGuardado('');
    setEsError(true);
    setMostrarFormulario(false);
    return;
  }
  try {
    const res = await fetch(`http://localhost:5000/vehiculos/flota`);
    const data = await res.json();

    const patenteBuscada = form.patente.trim().toUpperCase();

    const vehiculo = data.vehiculos.find(
      (v: Vehiculo) => v.matricula.toUpperCase() === patenteBuscada
    );

    if (vehiculo) {
      setEsCargaDesdeBackend(true);
      setForm({
        ...form,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio.toString(),
        capacidad: vehiculo.capacidad.toString(),
        categoria: vehiculo.tipo,
        precio_dia: vehiculo.precio_por_dia.toString(),
        localidad: vehiculo.localidad,
        politica_cancelacion: vehiculo.politica_cancelacion,
        estado: vehiculo.estado,
      });

      setMensajeBusqueda(`Vehículo con matrícula ${form.patente} encontrado. Ahora podés modificarlo.`);
      setMensajeGuardado('');
      setEsError(false);
      setMostrarFormulario(true);

      // 🔆 Activa el efecto visual verde claro por 2 segundos
      setCamposAutocompletados(true);
      setTimeout(() => setCamposAutocompletados(false), 2000);
    } else {
      setMensajeBusqueda('No se encontró un vehículo con esa matrícula');
      setMensajeGuardado('');
      setEsError(true);
      setMostrarFormulario(false);
    }
  } catch (error) {
    setMensajeBusqueda('Error al buscar el vehículo');
    setMensajeGuardado('');
    setEsError(true);
    setMostrarFormulario(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeBusqueda('');
    setMensajeGuardado('');
    setEsError(false);
    if (!validarCampos()) {
      setMensajeGuardado('Por favor, corregí los errores antes de continuar.');
      setEsError(true);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/vehiculos/modificar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensajeGuardado(data.message || 'Error al modificar vehículo');
        setEsError(true);
        return;
      }
      setMensajeGuardado(data.message || `Vehículo con matrícula ${form.patente} actualizado con éxito`);
      setEsError(false);
    } catch (error) {
      setMensajeGuardado('Error de conexión con el servidor');
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

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Patente"
              name="patente"
              value={form.patente}
              onChange={handleInputChange}
              error={!!errores.patente}
              helperText={errores.patente}

            />
            {mensajeBusqueda && (
  <Typography align="center" color={esError ? 'error' : 'success'}>
    {mensajeBusqueda}
  </Typography>
)}

            <Button variant="outlined" onClick={handleBuscarVehiculo} color="secondary">Buscar Vehículo</Button>

            {mostrarFormulario && (
              <>
           <FormControl fullWidth error={!!errores.marca}>
  <InputLabel>Marca</InputLabel>
  <Select
    name="marca"
    value={form.marca}
    onChange={handleSelectChange}
    label="Marca"
  >
    {Object.keys(marcasModelos).map((marca) => (
      <MenuItem key={marca} value={marca}>{marca}</MenuItem>
    ))}
  </Select>
  {errores.marca && (
    <Typography color="error" variant="caption">{errores.marca}</Typography>
  )}
</FormControl>
<FormControl fullWidth error={!!errores.modelo} disabled={!form.marca}>
  <InputLabel>Modelo</InputLabel>
  <Select
  name="modelo"
  value={form.modelo}
  onChange={handleSelectChange}
  label="Modelo"
  labelId="modelo-label"
>
  {modelosDisponibles.map((modelo) => (
    <MenuItem key={modelo} value={modelo}>{modelo}</MenuItem>
  ))}
</Select>

  {errores.modelo && (
    <Typography color="error" variant="caption">{errores.modelo}</Typography>
  )}
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
  onChange={handleInputChange}
  error={!!errores.capacidad}
  helperText={errores.capacidad}
  inputProps={{
    inputMode: 'numeric',
    maxLength: 1
  }}
/>

  <FormControl fullWidth error={Boolean(errores.categoria)}>
<InputLabel id="categoria-label">Categoría</InputLabel>

  <Select
  labelId="categoria-label"
  name="categoria"
  value={form.categoria}
  onChange={handleSelectChange}
  label="Categoría"
>

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
  onChange={handleInputChange}
  error={!!errores.precio_dia}
  helperText={errores.precio_dia}
  inputProps={{
    inputMode: 'numeric',
    maxLength: 6
  }}
/>




<FormControl fullWidth error={!!errores.localidad}>
  <InputLabel>Sucursal</InputLabel>
  <Select
    name="localidad"
    value={form.localidad}
    onChange={handleSelectChange}
    label="Sucursal"
  >
    {localidades.map((suc) => (
      <MenuItem key={suc.id} value={suc.id.toString()}>
        {suc.nombre} - {suc.localidad}
      </MenuItem>
    ))}
  </Select>
  {errores.localidad && (
    <Typography color="error" variant="caption">{errores.localidad}</Typography>
  )}
</FormControl>

<FormControl fullWidth error={!!errores.politica_cancelacion}>
  <InputLabel>Política de Cancelación</InputLabel>
  <Select
    name="politica_cancelacion"
    value={form.politica_cancelacion}
    onChange={handleSelectChange}
    label="Política de Cancelación"
  >
    <MenuItem value="1">100% de devolución</MenuItem>
    <MenuItem value="2">20% de devolución</MenuItem>
    <MenuItem value="3">Sin devolución</MenuItem>
  </Select>
  {errores.politica_cancelacion && (
    <Typography color="error" variant="caption">{errores.politica_cancelacion}</Typography>
  )}
</FormControl>


                <FormControl fullWidth error={!!errores.estado}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={form.estado}
                    onChange={handleSelectChange}
                    label="Estado"
                  >
                    <MenuItem value="1">Disponible</MenuItem>
                    <MenuItem value="2">Reservado</MenuItem>
                    <MenuItem value="3">En mantenimiento</MenuItem>
                  </Select>
                  {errores.estado && (
                    <Typography color="error" variant="caption">{errores.estado}</Typography>
                  )}
                </FormControl>
                {mensajeGuardado && (
                  <Typography align="center" color={esError ? 'error' : 'success'}>
                    {mensajeGuardado}
                  </Typography>
                )}


                <Button type="submit" variant="contained" color="secondary" sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}>
                  Guardar Cambios
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}