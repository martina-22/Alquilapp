import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface FormularioUsuario {
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  contrasena: string;
}

export default function RegistroUsuarioForm() {
  const [form, setForm] = useState<FormularioUsuario>({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    contrasena: '',
  });

  const [mensaje, setMensaje] = useState<string>('');
  const [esError, setEsError] = useState<boolean>(false);
  const [errores, setErrores] = useState<Partial<FormularioUsuario>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Elimina el error en cuanto el campo se corrige
    if (errores[name as keyof FormularioUsuario]) {
      setErrores((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setErrores({});

    const nuevosErrores: Partial<FormularioUsuario> = {};

    if (!form.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!form.apellido) nuevosErrores.apellido = 'El apellido es obligatorio';
    if (!form.dni) nuevosErrores.dni = 'El DNI es obligatorio';
    if (!form.fecha_nacimiento) nuevosErrores.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    if (!form.telefono) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?\d{7,15}$/.test(form.telefono)) {
      nuevosErrores.telefono = 'Número inválido. Usá solo números (7 a 15 cifras), opcional "+" al inicio';
    }
    if (!form.email) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'El formato del email es inválido';
    }
    if (!form.contrasena) nuevosErrores.contrasena = 'La contraseña es obligatoria';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || 'Error desconocido';
        if (msg.includes('correo') || msg.includes('email')) {
          setErrores(prev => ({ ...prev, email: msg }));
        } else if (msg.includes('contraseña')) {
          setErrores(prev => ({ ...prev, contrasena: msg }));
        } else if (msg.includes('fecha')) {
          setErrores(prev => ({ ...prev, fecha_nacimiento: msg }));
        } else {
          setMensaje(msg);
          setEsError(true);
        }
        return;
      }

      setMensaje(data.message || 'Registro exitoso');
      setEsError(false);
      setForm({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        email: '',
        contrasena: '',
      });

      navigate('/login', {
        state: { mensajeRegistro: 'Usuario registrado con éxito' }
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
            Registrate
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
              { label: 'Apellido', name: 'apellido', type: 'text' },
              { label: 'DNI', name: 'dni', type: 'number' },
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
                error={Boolean(errores[name as keyof FormularioUsuario])}
                helperText={errores[name as keyof FormularioUsuario]}
                InputLabelProps={type === 'date' ? { shrink: true } : undefined}
              />
            ))}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}
            >
              Registrarse
            </Button>

            {mensaje && (
              <Typography align="center" color={esError ? 'error' : 'success'}>
                {mensaje}
              </Typography>
            )}

            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => navigate('/login')}
            >
              ¿Ya tenés cuenta? Iniciar sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
