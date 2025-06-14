import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  const [mostrar2fa, setMostrar2fa] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  const [errores, setErrores] = useState<{
    email?: string;
    password?: string;
    codigo2fa?: string;
  }>({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.mensajeRegistro) {
      setMensaje(location.state.mensajeRegistro);
      setEsError(false);
    }
  }, [location.state]);

  const handleLogin = async () => {
  setMensaje('');
  setEsError(false);
  setErrores({});

  const nuevosErrores: typeof errores = {};
  if (!email) nuevosErrores.email = 'El email es obligatorio';
  if (!password) nuevosErrores.password = 'La contraseña es obligatoria';

  if (Object.keys(nuevosErrores).length > 0) {
    setErrores(nuevosErrores);
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMensaje(data.message || 'Error al iniciar sesión');
      setEsError(true);
      return;
    }

    if (data.require_2fa) {
      setMostrar2fa(true);
      setMensaje('Se ha enviado un código de verificación');
      setEsError(false);
    } else {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario_id', data.usuario_id);
      localStorage.setItem('rol', data.rol);

      // 🔁 Redirigir según rol
      if (data.rol === 'admin') {
        navigate('/verflota');
      } else {
        navigate('/');
      }
    }
  } catch (error) {
    setMensaje('Error de conexión con el servidor');
    setEsError(true);
  }
};

 const handleVerificar2FA = async () => {
  setMensaje('');
  setErrores({});

  if (!codigo2fa) {
    setErrores({ codigo2fa: 'El código es obligatorio' });
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/auth/verificar-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo: codigo2fa }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMensaje(data.message || 'Error al verificar 2FA');
      setEsError(true);
      return;
    }

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('usuario_id', data.usuario_id);
    localStorage.setItem('rol', data.rol);

    if (data.rol === 'admin') {
      navigate('/ver-flota');
    } else {
      navigate('/');
    }
  } catch (error) {
    setMensaje('Error de conexión con el servidor');
    setEsError(true);
  }
};


  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f0f2f5"
      padding={2}
    >
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="secondary" fontWeight="bold" gutterBottom>
            Iniciar Sesión
          </Typography>

          <Box component="form" display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errores.email) setErrores((prev) => ({ ...prev, email: '' }));
              }}
              type="email"
              error={Boolean(errores.email)}
              helperText={errores.email}
            />

            <TextField
              label="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errores.password) setErrores((prev) => ({ ...prev, password: '' }));
              }}
              type="password"
              error={Boolean(errores.password)}
              helperText={errores.password}
            />

            {mostrar2fa && (
              <TextField
                label="Código de verificación"
                value={codigo2fa}
                onChange={(e) => {
                  setCodigo2fa(e.target.value);
                  if (errores.codigo2fa) setErrores((prev) => ({ ...prev, codigo2fa: '' }));
                }}
                error={Boolean(errores.codigo2fa)}
                helperText={errores.codigo2fa}
              />
            )}

            <Button
              variant="contained"
              color="secondary"
              onClick={mostrar2fa ? handleVerificar2FA : handleLogin}
              sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}
            >
              {mostrar2fa ? 'Verificar Código' : 'Ingresar'}
            </Button>

            {mensaje && (
              <Typography align="center" color={esError ? 'error' : 'success'}>
                {mensaje}
              </Typography>
            )}

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/registro')}
            >
              ¿No tenés cuenta? Registrate
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}