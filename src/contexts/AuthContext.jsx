import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '../lib/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const response = await api.get(`/api/users/${firebaseUser.uid}`);
        const backendProfile = response.data;
        
        // Merge firebase user and backend profile
        const combinedUser = {
          ...firebaseUser,       // uid, email, etc. from firebase
          ...backendProfile,     // nombre, foto_url, etc. from backend
        };

        setUser(combinedUser);
      } catch (error) {
        console.error("Failed to fetch user profile, using Firebase data only.", error);
        // If backend call fails, fall back to just firebase user
        setUser(firebaseUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, fetchUserProfile);
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    refreshUserProfile: () => fetchUserProfile(auth.currentUser),
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
