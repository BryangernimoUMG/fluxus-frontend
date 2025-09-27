import { api } from '../../../lib/api';

export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/api/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
