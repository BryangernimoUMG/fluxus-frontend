import api from '../../../lib/axios';
import { auth } from '../../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
} from 'firebase/auth';
import Swal from 'sweetalert2';
import {
  createResolverFromError,
  sendMfaSignInCode,
  finalizeMfaSignIn,
} from './mfaService';

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();

    const response = await api.post('/api/users/login', { idToken });
    return response.data;
  } catch (error) {
    // Caso especial: el usuario tiene MFA y se requiere el segundo factor
    if (error?.code === 'auth/multi-factor-auth-required') {
      const resolver = createResolverFromError(error);
      // Devolvemos un objeto semántico para que la UI dispare el flujo MFA
      const mfaError = new Error('Se requiere verificación en dos pasos');
      mfaError.code = 'mfa-required';
      mfaError.resolver = resolver;
      throw mfaError;
    }
    if (error.response) {
      // Error del backend
      console.error('Backend login error:', error.response.data);
      throw new Error(
        error.response.data.message ||
          'Error del servidor. Por favor, inténtalo más tarde.'
      );
    } else if (error.request) {
      // No se recibió respuesta del servidor
      console.error('No response from server:', error.request);
      throw new Error(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      );
    } else if (error.code && error.code.startsWith('auth/')) {
      // Error de Firebase
      console.error('Firebase auth error:', error.code);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        case 'auth/invalid-email':
          throw new Error('El formato del correo electrónico no es válido.');
        case 'auth/too-many-requests':
          throw new Error('Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.');
        default:
          throw new Error('Ocurrió un error durante la autenticación.');
      }
    } else {
      // Otro tipo de error
      console.error('Unknown login error:', error);
      throw new Error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    }
  }
};

// Enviar código de SMS para el login MFA (elige el primer factor por defecto)
export const sendMfaLoginCode = async (resolver, hintUid) => {
  return await sendMfaSignInCode(resolver, hintUid);
};

// Finaliza el login con MFA y realiza el login en backend
export const completeMfaSignIn = async (resolver, verificationId, code) => {
  const userCredential = await finalizeMfaSignIn(resolver, verificationId, code);
  const idToken = await userCredential.user.getIdToken();
  const response = await api.post('/api/users/login', { idToken });
  return response.data;
};

export const register = async (email, password, userData) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Envía correo de verificación inmediatamente después del alta en Firebase
  try {
    await sendEmailVerification(userCredential.user);
  } catch (e) {
    console.error('Failed to send email verification:', e);
    // No interrumpimos el registro en backend si el envío falla; el usuario podrá reintentar desde Configuración.
  }
  const idToken = await userCredential.user.getIdToken();

  const response = await api.post('/api/users/register', {
    idToken,
    ...userData,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
  await signOut(auth);
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No hay un usuario autenticado.');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    switch (error.code) {
      case 'auth/wrong-password':
        throw new Error('La contraseña actual es incorrecta.');
      case 'auth/weak-password':
        throw new Error('La nueva contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      default:
        throw new Error('Ocurrió un error al cambiar la contraseña.');
    }
  }
};

// Permite reenviar el correo de verificación desde la UI de configuración
export const sendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay un usuario autenticado.');
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Has solicitado demasiados correos en poco tiempo. Intenta más tarde.');
    }
    throw new Error('No se pudo enviar el correo de verificación.');
  }
};

