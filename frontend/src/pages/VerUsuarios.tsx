import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  es_admin: boolean;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo?: boolean;
  rol: number | string; // Aseguramos que rol sea number o string
}

export default function VerUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [usuarioARestaurar, setUsuarioARestaurar] = useState<Usuario | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/usuarios')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar usuarios');
        return res.json();
      })
      .then(data => {
        setUsuarios(data.usuarios || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

    // Filtra solo usuarios que NO sean admin (rol: 1 = admin, tipo number o string)
    const usuariosNoAdmin = usuarios.filter(u => u.rol !== 1 && u.rol !== "1");
    // Luego separa activos e inactivos
    const usuariosActivos = usuariosNoAdmin.filter(u => u.activo);
    const usuariosInactivos = usuariosNoAdmin.filter(u => !u.activo);

  // Eliminar
  const handleOpenDeleteDialog = (usuario: Usuario) => {
    setUsuarioAEliminar(usuario);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUsuarioAEliminar(null);
    setDeleteError(null);
  };

  const handleDeleteProfile = async () => {
    if (!usuarioAEliminar) return;
    setDeleteError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/usuarios/${usuarioAEliminar.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el perfil.');
      }
      setUsuarios(usuarios.map(u =>
        u.id === usuarioAEliminar.id ? { ...u, activo: false } : u
      ));
      handleCloseDeleteDialog();
    } catch (error: any) {
      setDeleteError(error.message || 'No se pudo eliminar el perfil.');
    }
  };

  // Restaurar
  const handleOpenRestoreDialog = (usuario: Usuario) => {
    setUsuarioARestaurar(usuario);
    setRestoreDialogOpen(true);
    setRestoreError(null);
  };

  const handleCloseRestoreDialog = () => {
    setRestoreDialogOpen(false);
    setUsuarioARestaurar(null);
    setRestoreError(null);
  };

  const handleRestoreProfile = async () => {
    if (!usuarioARestaurar) return;
    setRestoreError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/usuarios/${usuarioARestaurar.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al restaurar el perfil.');
      }
      setUsuarios(usuarios.map(u =>
        u.id === usuarioARestaurar.id ? { ...u, activo: true } : u
      ));
      handleCloseRestoreDialog();
    } catch (error: any) {
      setRestoreError(error.message || 'No se pudo restaurar el perfil.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;


  // cambiar el navigate --> ir a pagina de inicio
  return (
    <Box p={4}>
      <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} sx={{ mb: 2 }}> 
        Volver
      </Button>

      <Typography variant="h4" gutterBottom>Usuarios Activos</Typography>
      <Grid container spacing={2} mb={4}>
        {usuariosActivos.map((usuario: Usuario) => (
          <Grid item xs={12} md={6} key={usuario.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{usuario.nombre} {usuario.apellido}</Typography>
                <Typography>Email: {usuario.email}</Typography>
                {usuario.telefono && <Typography>Teléfono: {usuario.telefono}</Typography>}
                <Typography color="green">Activo</Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
                  onClick={() => handleOpenDeleteDialog(usuario)}
                >
                  Eliminar perfil
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" gutterBottom>Usuarios Inactivos</Typography>
      <Grid container spacing={2}>
        {usuariosInactivos.map((usuario: Usuario) => (
          <Grid item xs={12} md={6} key={usuario.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{usuario.nombre} {usuario.apellido}</Typography>
                <Typography>Email: {usuario.email}</Typography>
                {usuario.telefono && <Typography>Teléfono: {usuario.telefono}</Typography>}
                <Typography color="red">Inactivo</Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
                  onClick={() => handleOpenRestoreDialog(usuario)}
                >
                  Restaurar perfil
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>¿Eliminar perfil?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el perfil de <b>{usuarioAEliminar?.nombre} {usuarioAEliminar?.apellido}</b>? Esta acción no se puede deshacer.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteProfile} color="secondary" variant="contained">
            Eliminar
          </Button>
          <Button onClick={handleCloseDeleteDialog} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de restaurar */}
      <Dialog open={restoreDialogOpen} onClose={handleCloseRestoreDialog}>
        <DialogTitle>¿Restaurar perfil?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas restaurar el perfil de <b>{usuarioARestaurar?.nombre} {usuarioARestaurar?.apellido}</b>?
          </Typography>
          {restoreError && <Alert severity="error" sx={{ mt: 2 }}>{restoreError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestoreProfile} color="secondary" variant="contained">
            Restaurar
          </Button>
          <Button onClick={handleCloseRestoreDialog} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}