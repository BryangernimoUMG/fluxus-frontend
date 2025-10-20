
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

// Fetch single transaction by id
export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction by id:', error);
    throw error;
  }
};

// Update an existing transaction
export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.patch(`/api/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/api/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
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
