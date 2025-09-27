import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Divider } from '@mui/material';
import { auth } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  sendEmailVerification,
  PhoneAuthProvider,
  RecaptchaVerifier,
  multiFactor,
  PhoneMultiFactorGenerator,
  reload,
} from 'firebase/auth';

/**
 * Componente para gestionar configuración de 2FA (MFA) con SMS usando Firebase.
 * Casos:
 * 1. Email no verificado -> Botón para reenviar verificación.
 * 2. Email verificado y sin factores enrolados -> Formulario para registrar teléfono.
 * 3. Ya enrolado -> Mensaje informativo.
 *
 * Recaptcha: se instancia una sola vez (useRef) y se reutiliza. Invisible para UX limpia.
 */
export function TwoFactorSettings() {
  const { user } = useAuth();
  const [emailVerified, setEmailVerified] = useState(() => user?.emailVerified ?? false);
  const [checkingEnrollments, setCheckingEnrollments] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sendingCode | codeSent | enrolling
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const recaptchaRef = useRef(null);
  const recaptchaContainerId = 'recaptcha-mfa-enroll';

  const destroyRecaptcha = () => {
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch (_) {}
      recaptchaRef.current = null;
    }
  };

  const ensureRecaptcha = useCallback(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA resuelto
        },
        'expired-callback': () => {
          destroyRecaptcha();
        },
      });
    }
    return recaptchaRef.current;
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setEmailVerified(auth.currentUser.emailVerified);
    }
  };

  // Verificar factores enrolados al montar o cuando cambie el usuario.
  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!auth.currentUser) {
        setCheckingEnrollments(false);
        return;
      }
      try {
        await reload(auth.currentUser); // asegurar estado fresco
        const factors = multiFactor(auth.currentUser).enrolledFactors || [];
        if (active) {
          setEmailVerified(auth.currentUser.emailVerified);
          setEnrolled(factors.length > 0);
        }
      } catch (e) {
        console.error('Error revisando factores MFA', e);
      } finally {
        if (active) setCheckingEnrollments(false);
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [user]);

  const handleResendVerification = async () => {
    setError('');
    setSuccess('');
    try {
      if (!auth.currentUser) throw new Error('No hay usuario autenticado.');
      await sendEmailVerification(auth.currentUser);
      setSuccess('Correo de verificación reenviado. Revisa tu bandeja o spam.');
    } catch (e) {
      console.error(e);
      setError('No se pudo reenviar el correo de verificación.');
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!emailVerified) {
      setError('Primero debes verificar tu correo electrónico.');
      return;
    }
    if (!phone.startsWith('+')) {
      setError('El teléfono debe estar en formato E.164. Ej: +50212345678');
      return;
    }
    try {
      setStatus('sendingCode');
      const verifier = ensureRecaptcha();
      const provider = new PhoneAuthProvider(auth);
      // Forzar un reload previo (a veces credenciales caducadas causan INVALID_APP_CREDENTIAL)
      await reload(auth.currentUser);
      const vId = await provider.verifyPhoneNumber(phone, verifier);
      setVerificationId(vId);
      setStatus('codeSent');
      setSuccess('Código SMS enviado. Revisa tu teléfono.');
    } catch (e) {
      console.error(e);
      if (e.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else if (e.code === 'auth/invalid-phone-number') {
        setError('Número de teléfono inválido.');
      } else if (e.code === 'auth/operation-not-allowed') {
        setError('El proveedor de teléfono o MFA no está habilitado.');
      } else if (e.code === 'auth/invalid-app-credential') {
        setError('Credencial de la app inválida. Revisa: (1) habilitar Phone en Firebase, (2) dominio autorizado, (3) no bloquear scripts reCAPTCHA, (4) variables .env correctas.');
      } else {
        setError('Error enviando el código SMS.');
      }
      try {
        destroyRecaptcha();
      } catch (_) {}
      setStatus('idle');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!verificationId) {
      setError('Primero solicita el código SMS.');
      return;
    }
    if (!code) {
      setError('Ingresa el código de verificación.');
      return;
    }
    try {
      setStatus('enrolling');
      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(auth.currentUser).enroll(assertion, 'Teléfono Principal');
      setSuccess('Autenticación de dos factores configurada correctamente.');
      setEnrolled(true);
      setStatus('idle');
    } catch (e) {
      console.error(e);
      if (e.code === 'auth/invalid-verification-code') {
        setError('El código ingresado es inválido.');
      } else if (e.code === 'auth/session-expired') {
        setError('La sesión del código ha expirado. Solicita uno nuevo.');
      } else {
        setError('No se pudo completar el enrolamiento.');
      }
      setStatus('codeSent');
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Autenticación de Dos Factores (SMS)
      </Typography>
      {checkingEnrollments && <CircularProgress size={24} />}
      {!checkingEnrollments && (
        <>
          {!emailVerified && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Debes verificar tu correo antes de habilitar 2FA.
              </Alert>
              <Button variant="contained" onClick={handleResendVerification} sx={{ mr: 2 }}>
                Reenviar correo de verificación
              </Button>
              <Button variant="text" onClick={refreshUser}>
                Ya lo verifiqué, actualizar estado
              </Button>
            </Box>
          )}

          {emailVerified && !enrolled && (
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }} component="form">
              <Typography variant="body1" sx={{ mb: 2 }}>
                Vincula tu número para recibir un SMS cada vez que inicies sesión.
              </Typography>
              <TextField
                label="Número de teléfono (E.164)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.trim())}
                fullWidth
                disabled={status === 'sendingCode' || status === 'codeSent' || status === 'enrolling'}
                sx={{ mb: 2 }}
                placeholder="Ej: +50212345678"
              />
              {status === 'codeSent' && (
                <TextField
                  label="Código SMS"
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {status !== 'codeSent' && (
                <Button
                  variant="contained"
                  onClick={handleSendCode}
                  disabled={status === 'sendingCode'}
                  sx={{ mr: 2 }}
                >
                  {status === 'sendingCode' ? <CircularProgress size={20} /> : 'Enviar Código'}
                </Button>
              )}
              {status === 'codeSent' && (
                <Button
                  variant="contained"
                  onClick={handleEnroll}
                  disabled={status === 'enrolling'}
                  sx={{ mr: 2 }}
                >
                  {status === 'enrolling' ? <CircularProgress size={20} /> : 'Confirmar Código'}
                </Button>
              )}
              {status === 'codeSent' && (
                <Button
                  variant="text"
                  onClick={(e) => { e.preventDefault(); setStatus('idle'); setVerificationId(null); setCode(''); setSuccess(''); setError(''); }}
                  disabled={status === 'enrolling'}
                >
                  Cancelar
                </Button>
              )}
              {/* Contenedor requerido por reCAPTCHA (invisible) */}
              <div id={recaptchaContainerId} style={{ display: 'none' }} />
              {status === 'idle' && (
                <Button
                  size="small"
                  variant="text"
                  onClick={(e) => { e.preventDefault(); destroyRecaptcha(); ensureRecaptcha(); setError(''); setSuccess('reCAPTCHA reiniciado.'); }}
                  sx={{ mt: 1 }}
                >
                  Reiniciar reCAPTCHA
                </Button>
              )}
            </Box>
          )}

          {emailVerified && enrolled && (
            <Alert severity="success">
              La autenticación de dos factores vía SMS ya está configurada para tu cuenta.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
}

export default TwoFactorSettings;
