
import api from '../../../lib/axios';

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/api/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const getCategoryReport = async (from, to) => {
  try {
    const response = await api.get('/api/transactions/reports/by-category', {
      params: { from, to },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching category report:', error);
    throw error;
  }
};

export const getAccountReport = async (from, to) => {
  try {
    const response = await api.get('/api/transactions/reports/by-account', {
      params: { from, to },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching account report:', error);
    throw error;
  }
};

export const getLatestTransactions = async (limit = 20) => {
  try {
    const response = await api.get('/api/transactions/latest', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching latest transactions:', error);
    throw error;
  }
};
