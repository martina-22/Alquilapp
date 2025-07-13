import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function RecuperarCuenta() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [step, setStep] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const enviarCodigo = async () => {
  setError('');
  try {
    const res = await fetch('http://localhost:5000/auth/recuperar-cuenta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      setMensaje('Código enviado a tu correo. Ingresalo abajo para reactivar tu cuenta.');
      setStep(2);  // ✅ Cambiamos de paso
    } else {
      setError(data.message);
    }
  } catch {
    setError('Error al conectar con el servidor');
  }
};

 const verificarCodigo = async () => {
  setError('');
  try {
    const res = await fetch('http://localhost:5000/auth/verificar-codigo-recuperacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('rol', 'cliente');
      setMensaje('Cuenta recuperada con éxito. Redirigiendo...');
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError(data.message);
    }
  } catch {
    setError('Error al conectar con el servidor');
  }
};

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: '#2B2645' }}>
            Recuperar Cuenta
          </Typography>

          {step === 1 && (
            <>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={enviarCodigo}>
                Enviar código de verificación
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                label="Código de verificación"
                fullWidth
                margin="normal"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={verificarCodigo}>
                Verificar y reactivar cuenta
              </Button>
            </>
          )}

          {mensaje && (
            <Typography sx={{ mt: 2, color: 'green', textAlign: 'center' }}>{mensaje}</Typography>
          )}
          {error && (
            <Typography sx={{ mt: 2, color: 'red', textAlign: 'center' }}>{error}</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
