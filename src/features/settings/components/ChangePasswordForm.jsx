import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { changePassword as changePasswordService } from '../../auth/services/authService';

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }

    setLoading(true);
    try {
      await changePasswordService(currentPassword, newPassword);
      setSuccess('¡Contraseña actualizada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>
        Cambiar Contraseña
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        name="currentPassword"
        label="Contraseña Actual"
        type="password"
        id="currentPassword"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="newPassword"
        label="Nueva Contraseña"
        type="password"
        id="newPassword"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirmar Nueva Contraseña"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;
