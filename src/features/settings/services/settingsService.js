import api from '../../../lib/axios';

export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/api/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};
