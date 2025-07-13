import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  MenuItem, FormControl, InputLabel, Select, Snackbar, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

interface FormularioEmpleado {
  id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  numero_empleado: string;
  sucursal_id: string;
}

interface Sucursal {
  id: string;
  nombre: string;
}

export default function ModificarEmpleadoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormularioEmpleado>({
    nombre: '', apellido: '', dni: '', fecha_nacimiento: '',
    telefono: '', email: '', numero_empleado: '', sucursal_id: ''
  });
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errores, setErrores] = useState<Partial<FormularioEmpleado>>({});

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/usuarios/empleados/activos`)
      .then(res => res.json())
      .then(async (empleados) => {
        const encontrado = empleados.find((emp: any) => String(emp.id) === String(id));
        if (!encontrado) {
          setMensaje('Empleado no encontrado');
          setEsError(true);
          setOpenSnackbar(true);
          return;
        }

        const numero = encontrado.numero_empleado;

        const res = await fetch(`http://localhost:5000/usuarios/empleados/buscar/${numero}`);
        const data = await res.json();
        if (res.ok) {
          setForm({
            id: data.id,
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            fecha_nacimiento: data.fecha_nacimiento,
            telefono: data.telefono,
            email: data.email,
            numero_empleado: data.numero_empleado,
            sucursal_id: data.sucursal_id
          });
        } else {
          setMensaje(data.message || 'Error al obtener datos');
          setEsError(true);
          setOpenSnackbar(true);
        }
      });

    fetch('http://localhost:5000/sucursales')
      .then(res => res.json())
      .then(data => setSucursales(data));
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof FormularioEmpleado]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const calcularEdad = (fecha: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);
    setErrores({});

    const nuevosErrores: Partial<FormularioEmpleado> = {};
    const campos = ["nombre", "apellido", "dni", "fecha_nacimiento", "telefono", "email", "sucursal_id"];

    campos.forEach((campo) => {
      if (!(form as any)[campo]) {
        nuevosErrores[campo as keyof FormularioEmpleado] = 'Campo obligatorio';
      }
    });

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (form.telefono && !/^\+?\d{7,15}$/.test(form.telefono)) {
      nuevosErrores.telefono = 'Número inválido';
    }

    if (form.fecha_nacimiento && calcularEdad(form.fecha_nacimiento) < 18) {
      nuevosErrores.fecha_nacimiento = 'El empleado debe tener al menos 18 años';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !form.id) throw new Error('Token o ID inválido');

      const res = await fetch(`http://localhost:5000/usuarios/empleados/${form.id}/modificar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      setMensaje(data.message || (res.ok ? 'Empleado modificado correctamente' : 'Error'));
      setEsError(!res.ok);
      setOpenSnackbar(true);

      if (res.ok) {
        setTimeout(() => navigate('/ListadoEmpleadosActivos'), 1500);
      }

    } catch {
      setEsError(true);
      setMensaje('Error de conexión');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="start" minHeight="100vh" bgcolor="#f4f4f4" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" fontWeight="bold" color="secondary">
            Modificar Empleado
          </Typography>

          <Box component="form" onSubmit={handleSubmit} mt={4} display="flex" flexDirection="column" gap={2}>
            <TextField label="Número de Empleado" name="numero_empleado" value={form.numero_empleado} disabled fullWidth />
            <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth error={Boolean(errores.nombre)} helperText={errores.nombre} />
            <TextField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} fullWidth error={Boolean(errores.apellido)} helperText={errores.apellido} />
            <TextField label="DNI" name="dni" value={form.dni} onChange={handleChange} fullWidth error={Boolean(errores.dni)} helperText={errores.dni} />
            <TextField label="Fecha de Nacimiento" type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} error={Boolean(errores.fecha_nacimiento)} helperText={errores.fecha_nacimiento} />
            <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth error={Boolean(errores.telefono)} helperText={errores.telefono} />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth error={Boolean(errores.email)} helperText={errores.email} />
            <FormControl fullWidth error={Boolean(errores.sucursal_id)}>
              <InputLabel>Sucursal</InputLabel>
              <Select name="sucursal_id" value={form.sucursal_id} label="Sucursal" onChange={handleChange}>
                {sucursales.map(suc => (
                  <MenuItem key={suc.id} value={suc.id}>{suc.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="secondary">
              Guardar Cambios
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={esError ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}