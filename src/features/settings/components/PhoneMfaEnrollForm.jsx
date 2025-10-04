import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Stack, TextField, Typography, Alert, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  startPhoneEnrollment,
  confirmPhoneEnrollment,
  listEnrolledFactors,
  unenrollFactor,
  isE164,
} from '../../auth/services/mfaService';
import ReauthDialog from '../../auth/components/ReauthDialog';

export function PhoneMfaEnrollForm() {
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [factors, setFactors] = useState([]);
  const [reauthOpen, setReauthOpen] = useState(false);
  const [postReauthAction, setPostReauthAction] = useState(null);

  const canSend = useMemo(() => isE164(phone) && !loading && !verificationId, [phone, loading, verificationId]);
  const canVerify = useMemo(() => code.length === 6 && !!verificationId && !loading, [code, verificationId, loading]);

  const refreshFactors = () => {
    try {
      const f = listEnrolledFactors();
      setFactors(f);
    } catch (e) {
      // ignore if not signed-in; page higher up handles auth state
    }
  };

  useEffect(() => {
    refreshFactors();
  }, []);

  const handleSendCode = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { verificationId } = await startPhoneEnrollment(phone);
      setVerificationId(verificationId);
      setMessage('Te enviamos un código por SMS. Ingrésalo para activar el 2FA.');
    } catch (e) {
      setError(e.message || 'No se pudo enviar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await confirmPhoneEnrollment(verificationId, code);
      setMessage('Doble factor activado correctamente.');
      setVerificationId('');
      setCode('');
      refreshFactors();
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        setPostReauthAction(() => handleVerify);
        setReauthOpen(true);
        return;
      } else if (e.code === 'auth/invalid-verification-code') {
        setError('El código es inválido.');
      } else if (e.code === 'auth/code-expired') {
        setError('El código expiró, solicita uno nuevo.');
      } else {
        setError(e.message || 'No se pudo activar el 2FA.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (uid) => {
    if (!window.confirm('¿Quitar este método de 2FA?')) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await unenrollFactor(uid);
      setMessage('Método de 2FA eliminado.');
      refreshFactors();
    } catch (e) {
        console.log(e);
      if (e.code === 'auth/requires-recent-login') {
        setPostReauthAction(() => () => handleRemove(uid));
        setReauthOpen(true);
        return;
      } else {
        setError(e.message || 'No se pudo eliminar el 2FA.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <ReauthDialog
        open={reauthOpen}
        onClose={() => setReauthOpen(false)}
        onSuccess={() => {
          setReauthOpen(false);
          // Reintenta la acción que solicitó reautenticación
          if (typeof postReauthAction === 'function') postReauthAction();
        }}
      />
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="subtitle1" gutterBottom>
        Activa 2FA por SMS
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        <TextField
          label="Teléfono (E.164)"
          placeholder="+502XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading || !!verificationId}
          sx={{ minWidth: 280 }}
        />
        <Button variant="contained" onClick={handleSendCode} disabled={!canSend}>
          {loading && !verificationId ? 'Enviando…' : 'Enviar código'}
        </Button>
      </Stack>

      {verificationId && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" sx={{ mt: 2 }}>
          <TextField
            label="Código SMS"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            inputProps={{ maxLength: 6 }}
            sx={{ minWidth: 180 }}
          />
          <Button variant="contained" onClick={handleVerify} disabled={!canVerify}>
            {loading ? 'Verificando…' : 'Verificar y activar'}
          </Button>
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" gutterBottom>
        Métodos de 2FA enrolados
      </Typography>
      {factors.length === 0 ? (
        <Alert severity="info">No tienes 2FA por SMS activo.</Alert>
      ) : (
        <List>
          {factors.map((f) => (
            <ListItem key={f.uid}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(f.uid)} disabled={loading}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={f.phoneNumber || 'Teléfono'} secondary={f.displayName || f.enrollmentTime} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default PhoneMfaEnrollForm;
