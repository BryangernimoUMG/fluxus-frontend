import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '../lib/api';
import {
  login as loginService,
  logout as logoutService,
} from '../features/auth/services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const backendUser = await loginService(email, password);
      const firebaseUser = auth.currentUser;

      const combinedUser = {
        ...firebaseUser,
        ...backendUser,
      };
      setUser(combinedUser);
      return combinedUser;
    } catch (error) {
      await logoutService();
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Cuando el estado de auth cambia, verificamos si tenemos un perfil en el backend
          const response = await api.get(`/api/users/${firebaseUser.uid}`);
          const backendProfile = response.data;

          const combinedUser = {
            ...firebaseUser,
            ...backendProfile,
          };
          setUser(combinedUser);
        } catch (error) {
          // Si el backend falla al inicio, podría ser que el usuario no ha completado el registro
          // o el backend está caído. En este caso, lo deslogueamos para forzar un login limpio.
          console.error("Failed to fetch user profile on auth state change, logging out.", error);
          await logoutService();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUserProfile: async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const response = await api.get(`/api/users/${firebaseUser.uid}`);
          const backendProfile = response.data;
          const combinedUser = { ...firebaseUser, ...backendProfile };
          setUser(combinedUser);
        } catch (error) {
          console.error("Failed to refresh user profile, logging out.", error);
          await logout();
        }
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
