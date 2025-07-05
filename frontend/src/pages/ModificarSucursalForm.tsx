// src/components/ModificarSucursalForm.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

interface FormularioSucursal {
  nombre: string;
  localidad: string;
  direccion: string;
  telefono: string;
}

export default function ModificarSucursalForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const sucursalId = (location.state as { sucursalId: string })?.sucursalId;

  const [form, setForm] = useState<FormularioSucursal>({
    nombre: '',
    localidad: '',
    direccion: '',
    telefono: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [errores, setErrores] = useState<Partial<FormularioSucursal>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/sucursales/${sucursalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setForm(data);
        setLoading(false);
      })
      .catch(err => {
        setMensaje(err.message || 'No se pudo cargar la sucursal');
        setEsError(true);
        setLoading(false);
      });
  }, [sucursalId]);

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
    ["nombre", "localidad", "direccion", "telefono"].forEach(campo => {
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
      const res = await fetch(`http://localhost:5000/sucursales/actualizar/${sucursalId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.error || 'No se pudo actualizar la sucursal');
        setEsError(true);
        return;
      }

      setMensaje(data.message || 'Sucursal actualizada con éxito');
      setEsError(false);

      setTimeout(() => navigate('/ListadoSucursales'), 2000);
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
            Modificar Sucursal
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : (
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
                { label: 'Nombre', name: 'nombre' },
                { label: 'Localidad', name: 'localidad' },
                { label: 'Dirección', name: 'direccion' },
                { label: 'Teléfono', name: 'telefono' },
              ].map(({ label, name }) => (
                <TextField
                  key={name}
                  fullWidth
                  label={label}
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  error={Boolean(errores[name as keyof FormularioSucursal])}
                  helperText={errores[name as keyof FormularioSucursal]}
                />
              ))}

              <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}>
                Guardar Cambios
              </Button>

              {mensaje && (
                <Alert severity={esError ? 'error' : 'success'} sx={{ mt: 2 }}>
                  {mensaje}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
