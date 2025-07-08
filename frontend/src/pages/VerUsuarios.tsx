import {
  Box, Typography, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper // <-- AÑADIDOS ESTOS COMPONENTES
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
  rol: number | string;
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

  return (
    <Box p={4}>
      <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      {/* Grid container principal para las dos columnas de usuarios */}
      <Grid container spacing={4}> {/* spacing para espacio entre las dos columnas principales */}

        {/* Columna para Usuarios Activos */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>Usuarios Activos</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de usuarios activos">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosActivos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay usuarios activos.</TableCell>
                  </TableRow>
                ) : (
                  usuariosActivos.map((usuario: Usuario) => (
                    <TableRow
                      key={usuario.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {usuario.nombre} {usuario.apellido}
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono || 'N/A'}</TableCell> {/* Muestra 'N/A' si no hay teléfono */}
                      <TableCell align="center">
                        <Typography color="green">Activo</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small" // Tamaño pequeño para encajar mejor en la celda
                          onClick={() => handleOpenDeleteDialog(usuario)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Columna para Usuarios Inactivos */}
        <Grid item xs={12} md={6}> {/* En pantallas pequeñas ocupa todo el ancho, en medianas y grandes la mitad */}
          <Typography variant="h4" gutterBottom>Usuarios Inactivos</Typography>
          <TableContainer component={Paper}> {/* Usamos TableContainer con Paper para el estilo de tarjeta */}
            <Table sx={{ minWidth: 650 }} aria-label="tabla de usuarios inactivos">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosInactivos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay usuarios inactivos.</TableCell>
                  </TableRow>
                ) : (
                  usuariosInactivos.map((usuario: Usuario) => (
                    <TableRow
                      key={usuario.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {usuario.nombre} {usuario.apellido}
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono || 'N/A'}</TableCell> {/* Muestra 'N/A' si no hay teléfono */}
                      <TableCell align="center">
                        <Typography color="red">Inactivo</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small" // Tamaño pequeño para encajar mejor en la celda
                          onClick={() => handleOpenRestoreDialog(usuario)}
                        >
                          Restaurar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

      </Grid> {/* Cierre del Grid container principal de las columnas */}

      {/* Diálogo de eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>¿Eliminar perfil?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el perfil de <b>{usuarioAEliminar?.nombre} {usuarioAEliminar?.apellido}</b>?
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