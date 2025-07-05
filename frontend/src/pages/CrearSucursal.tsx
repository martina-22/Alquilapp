import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';

interface FormularioSucursal {
  nombre: string;
  localidad: string;
  direccion: string;
  telefono: string;
}

export default function CrearSucursalForm() {
  const [form, setForm] = useState<FormularioSucursal>({
    nombre: '',
    localidad: '',
    direccion: '',
    telefono: '',
  });

  const [mensaje, setMensaje] = useState<string>('');
  const [esError, setEsError] = useState<boolean>(false);
  const [errores, setErrores] = useState<Partial<FormularioSucursal>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof FormularioSucursal]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setErrores({});

    const nuevosErrores: Partial<FormularioSucursal> = {};

    ["nombre", "localidad", "direccion", "telefono"].forEach((campo) => {
      if (!(form as any)[campo]) nuevosErrores[campo as keyof FormularioSucursal] = 'Campo obligatorio';
    });

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
        setMensaje('Debe iniciar sesión como administrador para crear sucursales');
        setEsError(true);
        return;
      }

      const res = await fetch('http://localhost:5000/sucursales/crear', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.message || data.error || 'Error desconocido');
        setEsError(true);
        return;
      }

      setMensaje(data.message || 'Sucursal creada con éxito');
      setEsError(false);
      setForm({ nombre: '', localidad: '', direccion: '', telefono: '' });
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
      setEsError(true);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f2f5" padding={2}>
      <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="secondary" fontWeight="bold" gutterBottom>
            Crear Sucursal
          </Typography>

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
              { label: 'Localidad', name: 'localidad', type: 'text' },
              { label: 'Dirección', name: 'direccion', type: 'text' },
              { label: 'Teléfono', name: 'telefono', type: 'text' },
            ].map(({ label, name, type }) => (
              <TextField
                key={name}
                fullWidth
                label={label}
                name={name}
                type={type}
                value={(form as any)[name]}
                onChange={handleChange}
                error={Boolean(errores[name as keyof FormularioSucursal])}
                helperText={errores[name as keyof FormularioSucursal]}
              />
            ))}

            <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}>
              Crear Sucursal
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
