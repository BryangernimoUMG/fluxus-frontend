import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Alert, Typography } from '@mui/material';
import { sendMfaLoginCode, completeMfaSignIn } from '../services/authService';

export default function MfaOtpDialog({ open, resolver, onClose, onSuccess }) {
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [targetPhone, setTargetPhone] = useState('');

  // Enviar el SMS cuando se abre el diálogo
  useEffect(() => {
    const send = async () => {
      if (!open || !resolver) return;
      setError('');
      setMessage('');
      setLoading(true);
      try {
        const { verificationId, hint } = await sendMfaLoginCode(resolver);
        setVerificationId(verificationId);
        setTargetPhone(hint?.phoneNumber || 'tu teléfono');
        setMessage('Te enviamos un código por SMS.');
      } catch (e) {
        if (e.code === 'auth/too-many-requests') setError('Demasiados intentos. Intenta más tarde.');
        else setError(e.message || 'No se pudo enviar el código.');
      } finally {
        setLoading(false);
      }
    };
    send();
  }, [open, resolver]);

  const handleVerify = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const backendUser = await completeMfaSignIn(resolver, verificationId, code);
      onSuccess?.(backendUser);
      onClose?.();
    } catch (e) {
      if (e.code === 'auth/invalid-verification-code') setError('Código inválido.');
      else if (e.code === 'auth/code-expired') setError('El código expiró, solicita uno nuevo.');
      else setError(e.message || 'No se pudo completar el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resolver) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { verificationId, hint } = await sendMfaLoginCode(resolver);
      setVerificationId(verificationId);
      setTargetPhone(hint?.phoneNumber || 'tu teléfono');
      setMessage('Nuevo código enviado.');
    } catch (e) {
      if (e.code === 'auth/too-many-requests') setError('Demasiados reintentos. Espera un momento.');
      else setError(e.message || 'No se pudo reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Verificación en dos pasos</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2">Enviamos un SMS a {targetPhone}.</Typography>
          <TextField
            label="Código SMS"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleResend} disabled={loading}>Reenviar</Button>
        <Button onClick={handleVerify} variant="contained" disabled={loading || code.length !== 6}>
          Verificar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
