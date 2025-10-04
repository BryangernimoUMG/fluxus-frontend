import { Typography, Box, Divider, Button, Alert, Stack } from '@mui/material';
import ChangePasswordForm from '../components/ChangePasswordForm';
import UpdateProfileForm from '../components/UpdateProfileForm';
import { useAuth } from '../../../contexts/AuthContext';
import { sendVerificationEmail } from '../../auth/services/authService';
import { useState } from 'react';
import PhoneMfaEnrollForm from '../components/PhoneMfaEnrollForm';

export default function ConfiguracionPage() {
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [info, setInfo] = useState('');
    const [error, setError] = useState('');

    const handleResend = async () => {
        setError('');
        setInfo('');
        setSending(true);
        try {
            await sendVerificationEmail();
            setInfo('Te enviamos un nuevo correo de verificación. Revisa tu bandeja de entrada y spam.');
        } catch (e) {
            setError(e.message || 'No se pudo reenviar el correo.');
        } finally {
            setSending(false);
        }
    };

    const isVerified = !!user?.emailVerified;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Configuración
            </Typography>
            <UpdateProfileForm />

            <Divider sx={{ my: 4 }} />
            <ChangePasswordForm />

            <Divider sx={{ my: 4 }} />
            <Box>
                <Typography variant="h6" gutterBottom>
                    Doble factor de autenticacion.
                </Typography>
                <Stack spacing={2}>
                    {isVerified ? (
                        <>
                            <Alert severity="success">Tu correo está verificado. Puedes activar el 2FA por SMS.</Alert>
                            <PhoneMfaEnrollForm />
                        </>
                    ) : (
                        <>
                            <Alert severity="warning">Tu cuenta aún no está verificada. Debes verificar tu correo para usar el doble factor.</Alert>
                            {info && <Alert severity="info">{info}</Alert>}
                            {error && <Alert severity="error">{error}</Alert>}
                            <Button variant="contained" onClick={handleResend} disabled={sending}>
                                {sending ? 'Enviando…' : 'Reenviar correo de verificación'}
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}
