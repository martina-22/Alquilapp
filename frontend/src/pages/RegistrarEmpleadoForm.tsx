import { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
interface FormularioEmpleado {
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  contrasena: string;
  sucursal_id: string;
}

interface Sucursal {
  id: string;
  nombre: string;
}

export default function RegistroEmpleadoForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormularioEmpleado>({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    contrasena: '',
    sucursal_id: '',
  });

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [mensaje, setMensaje] = useState<string>('');
  const [esError, setEsError] = useState<boolean>(false);
  const [errores, setErrores] = useState<Partial<FormularioEmpleado>>({});

  useEffect(() => {
    fetch('http://localhost:5000/sucursales')
      .then(res => res.json())
      .then(data => setSucursales(data))
      .catch(() => setSucursales([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name as keyof FormularioEmpleado]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
) => {
  const { name, value } = event.target;
  setForm(prev => ({
    ...prev,
    [name]: value,
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setErrores({});

    const nuevosErrores: Partial<FormularioEmpleado> = {};

    ["nombre", "apellido", "dni", "fecha_nacimiento", "telefono", "email", "contrasena", "sucursal_id"].forEach((campo) => {
      if (!(form as any)[campo]) nuevosErrores[campo as keyof FormularioEmpleado] = 'Campo obligatorio';
    });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (!/^\+?\d{7,15}$/.test(form.telefono)) {
      nuevosErrores.telefono = 'Número inválido';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const rol = localStorage.getItem('rol');

      if (!token || rol !== 'admin') {
        setMensaje('Debe iniciar sesión como administrador para registrar empleados');
        setEsError(true);
        return;
      }
      const res = await fetch('http://localhost:5000/auth/register-empleado', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.message || 'Error desconocido');
        setEsError(true);
        return;
      }

      setMensaje(data.message || 'Empleado registrado con éxito');
      setEsError(false);
      setForm({
        nombre: '', apellido: '', dni: '', fecha_nacimiento: '', telefono: '',
        email: '', contrasena: '', sucursal_id: ''
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
          <Box position="relative" mb={3}>
            <IconButton
              onClick={() => navigate('/GestionEmpleados')}
              color="secondary"
              sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" align="center" color="secondary" fontWeight="bold">
              Registrar Empleado
            </Typography>
          </Box>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
            mt={2}
          >
            {[
              { label: 'Nombre', name: 'nombre', type: 'text' },
              { label: 'Apellido', name: 'apellido', type: 'text' },
              { label: 'DNI', name: 'dni', type: 'text' },
              { label: 'Fecha de Nacimiento', name: 'fecha_nacimiento', type: 'date' },
              { label: 'Teléfono', name: 'telefono', type: 'text' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Contraseña', name: 'contrasena', type: 'password' },
            ].map(({ label, name, type }) => (
              <TextField
                key={name}
                fullWidth
                label={label}
                name={name}
                type={type}
                value={(form as any)[name]}
                onChange={handleChange}
                error={Boolean(errores[name as keyof FormularioEmpleado])}
                helperText={errores[name as keyof FormularioEmpleado]}
                InputLabelProps={type === 'date' ? { shrink: true } : undefined}
              />
            ))}

            <FormControl fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                name="sucursal_id"
                value={form.sucursal_id}
                label="Sucursal"
                onChange={handleSelectChange}
                error={Boolean(errores.sucursal_id)}
              >
                {sucursales.map((sucursal) => (
                  <MenuItem key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errores.sucursal_id && <Typography color="error" fontSize={12}>{errores.sucursal_id}</Typography>}
            </FormControl>

            <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}>
              Registrar Empleado
            </Button>

            {mensaje && (
              <Alert severity={esError ? 'error' : 'success'} sx={{ mt: 2 }}>
                {mensaje}
              </Alert>
            )}
            
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}