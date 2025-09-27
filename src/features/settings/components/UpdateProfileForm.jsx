import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { updateProfile } from '../services/settingsService';
import { TextField, Button, Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { api } from '../../../lib/api';

export default function UpdateProfileForm() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        foto_url: '',
        moneda_base: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const response = await api.get(`/api/users/${user.uid}`);
                    const profile = response.data.user;
                    setFormData({
                        nombre: profile.nombre || user.displayName || '',
                        foto_url: profile.foto_url || user.photoURL || '',
                        moneda_base: profile.moneda_base || '',
                    });
                } catch (err) {
                    setError('No se pudieron cargar los datos del perfil.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        const updatedData = {
            ...formData,
            uid: user.uid,
            email: user.email,
        };

        try {
            await updateProfile(updatedData);
            alert('Perfil actualizado con éxito');
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Hubo un error al actualizar el perfil');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Actualizar Datos del Perfil
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={formData.foto_url} sx={{ width: 80, height: 80, mr: 2 }} />
                <TextField
                    label="URL de la Foto"
                    name="foto_url"
                    value={formData.foto_url}
                    onChange={handleChange}
                    fullWidth
                />
            </Box>
            <TextField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
            />
            <TextField
                label="Moneda Base"
                name="moneda_base"
                value={formData.moneda_base}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary">
                Actualizar Perfil
            </Button>
        </Box>
    );
}
