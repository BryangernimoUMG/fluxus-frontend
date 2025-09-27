import api from '../../../lib/axios';

export const getWallets = async () => {
  try {
    const response = await api.get('/api/accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    throw error;
  }
};
