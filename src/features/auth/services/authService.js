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
} from 'firebase/auth';

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

