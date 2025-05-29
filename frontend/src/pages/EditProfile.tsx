// src/pages/EditProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function EditProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
  });


  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // Efecto para cargar los datos del perfil cuando el componente se monta
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}` // Envía el token si es necesario para obtener el perfil
          }
        });
        if (!res.ok) {
          throw new Error('No se pudo cargar el perfil. ¿Está autenticado?');
        }
        const data = await res.json();
        // Formatea la fecha de nacimiento para el input type="date" (YYYY-MM-DD)
        if (data.fecha_nacimiento) {
          data.fecha_nacimiento = new Date(data.fecha_nacimiento).toISOString().split('T')[0];
        }
        setProfile(data);
      } catch (error: any) {
        console.error("Error al cargar el perfil:", error);
        setSubmitError(error.message || 'Error al cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
    // Limpia el error si el usuario empieza a escribir en el campo
    if (errors[name as keyof typeof errors]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: '',
      }));
    }
    setSubmitError(null); // Limpia cualquier error de envío al cambiar un campo
    setSuccessMessage(null); // Limpia mensaje de éxito
  };

  const validateForm = () => {
    let tempErrors: typeof errors = { ...errors };
    let isValid = true;

    // Campos obligatorios
    if (!profile.nombre.trim()) {
      tempErrors.nombre = 'El nombre es obligatorio.';
      isValid = false;
    } else {
      tempErrors.nombre = '';
    }

    if (!profile.apellido.trim()) {
      tempErrors.apellido = 'El apellido es obligatorio.';
      isValid = false;
    } else {
      tempErrors.apellido = '';
    }

    if (!profile.email.trim()) {
      tempErrors.email = 'El email es obligatorio.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) { // Validación de formato de email
      tempErrors.email = 'El email no tiene un formato válido.';
      isValid = false;
    } else {
      tempErrors.email = '';
    }

    if (!profile.telefono.trim()) {
      tempErrors.telefono = 'El teléfono es obligatorio.';
      isValid = false;
    } else {
      tempErrors.telefono = '';
    }

    if (!profile.fecha_nacimiento) {
      tempErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria.';
      isValid = false;
    } else {
      const birthDate = new Date(profile.fecha_nacimiento);
      const today = new Date();
      const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
      );

      if (birthDate > eighteenYearsAgo) {
        tempErrors.fecha_nacimiento = 'Debes ser mayor de 18 años.';
        isValid = false;
      } else {
        tempErrors.fecha_nacimiento = '';
      }
    }
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita el recargado de la página

    setSubmitError(null); // Limpia errores anteriores
    setSuccessMessage(null); // Limpia mensajes de éxito anteriores

    if (validateForm()) {
      try {
         

        const res = await fetch('http://localhost:5000/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` // Envía el token en el encabezado Authorization
          },
          body: JSON.stringify(profile), // Envía los datos actualizados
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al actualizar el perfil.');
        }

        // Si la actualización fue exitosa
        setSuccessMessage('Perfil actualizado con éxito.');
        // Opcional: Redirigir al usuario de vuelta a la página de perfil después de un tiempo
        setTimeout(() => {
          navigate('/profile');
        }, 2000); // Redirige después de 2 segundos
      } catch (error: any) {
        console.error("Error al guardar el perfil:", error);
        setSubmitError(error.message || 'Hubo un problema al guardar el perfil.');
      }
    } else {
      setSubmitError('Por favor, completa todos los campos obligatorios y corrige los errores.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6">Cargando datos del perfil...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: '8px', bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Perfil de Usuario
        </Typography>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            value={profile.nombre || ''}
            onChange={handleChange}
            required // Propiedad para indicar que es obligatorio
            error={!!errors.nombre} // true si hay un mensaje de error
            helperText={errors.nombre} // Muestra el mensaje
          />
          <TextField
            fullWidth
            label="Apellido"
            name="apellido"
            value={profile.apellido || ''}
            onChange={handleChange}
            required
            error={!!errors.apellido}
            helperText={errors.apellido}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={profile.email || ''}
            onChange={handleChange}
            type="email"
            required
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={profile.telefono || ''}
            onChange={handleChange}
            type="tel"
            required
            error={!!errors.telefono}
            helperText={errors.telefono}
          />
          <TextField
            fullWidth
            label="Fecha de nacimiento"
            name="fecha_nacimiento"
            value={profile.fecha_nacimiento || ''}
            onChange={handleChange}
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            required
            error={!!errors.fecha_nacimiento}
            helperText={errors.fecha_nacimiento}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              color="primary"
              type="submit" // Botón que dispara el submit del formulario
              sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
            >
              Guardar Cambios
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/profile"
              sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default EditProfilePage;