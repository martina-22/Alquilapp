import React, { useState } from "react";
import { Box, Button, TextField, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Paso 1: Solicitar código
  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(""); setError("");
    try {
      const res = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.message);
        setStep(2);
      } else setError(data.message);
    } catch {
      setError("Error de conexión");
    }
  };

  // Paso 2: Verificar código
  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(""); setError("");
    try {
      const res = await fetch("http://localhost:5000/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.message);
        setStep(3);
      } else setError(data.message);
    } catch {
      setError("Error de conexión");
    }
  };

  // Paso 3: Cambiar contraseña y redirigir al login
  const handleCambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(""); setError("");
    try {
      const res = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, nueva_contrasena: nuevaContrasena }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(data.message + " Redirigiendo al inicio de sesión...");
        setTimeout(() => navigate("/login"), 2000);
      } else setError(data.message);
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Recuperar contraseña
          </Typography>

          {step === 1 && (
            <form onSubmit={handleEnviarCodigo}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="secondary" fullWidth>
                Enviar código
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerificarCodigo}>
              <TextField
                label="Código recibido"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="secondary" fullWidth>
                Verificar código
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCambiarContrasena}>
              <TextField
                label="Nueva contraseña"
                type="password"
                value={nuevaContrasena}
                onChange={e => setNuevaContrasena(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="secondary" fullWidth>
                Cambiar contraseña
              </Button>
            </form>
          )}

          {mensaje && <Typography color="success.main" align="center" mt={2}>{mensaje}</Typography>}
          {error && <Typography color="error.main" align="center" mt={2}>{error}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}