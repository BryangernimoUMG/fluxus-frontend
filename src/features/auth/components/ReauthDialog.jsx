import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Alert } from '@mui/material';
import { auth } from '../../../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function ReauthDialog({ open, onClose, onSuccess }) {
  const user = auth.currentUser;
  const email = user?.email || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReauth = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, cred);
      setPassword('');
      onSuccess?.();
      onClose?.();
    } catch (e) {
      if (e.code === 'auth/wrong-password') setError('Contraseña incorrecta.');
      else setError(e.message || 'No se pudo verificar tu identidad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar identidad</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Correo" value={email} disabled fullWidth />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleReauth} variant="contained" disabled={loading || !password}>Verificar</Button>
      </DialogActions>
    </Dialog>
  );
}
