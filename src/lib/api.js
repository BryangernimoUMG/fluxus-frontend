import axios from 'axios';
import { auth } from './firebase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function apiMessage(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (typeof err?.message === 'string') return err.message;
  return 'Ocurrió un error inesperado';
}
